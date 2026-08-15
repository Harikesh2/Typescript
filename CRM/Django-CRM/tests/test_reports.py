from datetime import timedelta

from django.urls import resolve
from django.utils import timezone

from website.models import Record


def test_reports_url_resolves():
    assert resolve('/api/reports/').func.__module__.startswith('api.views')


def test_reports_anonymous_forbidden(api_client):
    response = api_client.get('/api/reports/')
    assert response.status_code == 401


def test_reports_empty_returns_shape(auth_client, db):
    response = auth_client.get('/api/reports/')
    assert response.status_code == 200

    data = response.json()
    assert data['total_records'] == 0
    assert data['records_per_month'] == []
    assert data['by_state'] == []


def test_reports_aggregates(auth_client, db, make_record):
    now = timezone.now()
    record_old = make_record(first_name='Old', state='IL')
    Record.objects.filter(pk=record_old.pk).update(created_at=now - timedelta(days=120))
    make_record(first_name='Mid', state='IL')
    make_record(first_name='New', state='CA')

    response = auth_client.get('/api/reports/')
    assert response.status_code == 200

    data = response.json()
    assert data['total_records'] == 3
    assert data['by_state'][0]['state'] == 'IL'
    assert data['by_state'][0]['count'] == 2
    assert data['by_state'][1]['state'] == 'CA'
    assert data['by_state'][1]['count'] == 1

    months = data['records_per_month']
    assert len(months) == 2
    counts = [entry['count'] for entry in months]
    assert sorted(counts) == [1, 2]
    assert all(entry['month'] is not None for entry in months)


def test_reports_from_filter(auth_client, db, make_record):
    now = timezone.now()
    record_old = make_record(first_name='Old', state='IL')
    Record.objects.filter(pk=record_old.pk).update(created_at=now - timedelta(days=120))
    make_record(first_name='New', state='CA')

    since = (now - timedelta(days=30)).isoformat()
    response = auth_client.get('/api/reports/', {'from': since})
    assert response.status_code == 200

    data = response.json()
    assert data['total_records'] == 1
    assert data['by_state'][0]['state'] == 'CA'
    assert data['by_state'][0]['count'] == 1


def test_reports_to_filter(auth_client, db, make_record):
    now = timezone.now()
    record_old = make_record(first_name='Old', state='IL')
    Record.objects.filter(pk=record_old.pk).update(created_at=now - timedelta(days=120))
    make_record(first_name='New', state='CA')

    before = (now - timedelta(days=60)).isoformat()
    response = auth_client.get('/api/reports/', {'to': before})
    assert response.status_code == 200

    data = response.json()
    assert data['total_records'] == 1
    assert data['by_state'][0]['state'] == 'IL'
    assert data['by_state'][0]['count'] == 1


def test_reports_from_and_to_filter(auth_client, db, make_record):
    now = timezone.now()
    record_old = make_record(first_name='Old', state='IL')
    Record.objects.filter(pk=record_old.pk).update(created_at=now - timedelta(days=120))
    make_record(first_name='New', state='CA')

    since = (now - timedelta(days=200)).isoformat()
    before = (now - timedelta(days=100)).isoformat()
    response = auth_client.get('/api/reports/', {'from': since, 'to': before})
    assert response.status_code == 200

    data = response.json()
    assert data['total_records'] == 1
    assert data['by_state'][0]['state'] == 'IL'
    assert data['by_state'][0]['count'] == 1


def test_reports_invalid_from_400(auth_client, db):
    response = auth_client.get('/api/reports/', {'from': 'not-a-date'})
    assert response.status_code == 400
    assert 'from' in response.json()


def test_reports_invalid_to_400(auth_client, db):
    response = auth_client.get('/api/reports/', {'to': 'not-a-date'})
    assert response.status_code == 400
    assert 'to' in response.json()
