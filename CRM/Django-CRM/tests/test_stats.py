from datetime import timedelta

from django.urls import resolve
from django.utils import timezone

from website.models import Record


def test_stats_url_resolves():
    assert resolve('/api/stats/').func.__module__.startswith('api.views')


def test_stats_anonymous_forbidden(api_client):
    response = api_client.get('/api/stats/')
    assert response.status_code == 403


def test_stats_empty_returns_shape(auth_client, db):
    response = auth_client.get('/api/stats/')
    assert response.status_code == 200

    data = response.json()
    assert data['total_records'] == 0
    assert data['records_this_week'] == 0
    assert data['records_this_month'] == 0
    assert data['distinct_states'] == 0
    assert data['by_state'] == []
    assert data['newest_record'] is None


def test_stats_aggregates(auth_client, db, make_record):
    now = timezone.now()
    record_old = make_record(first_name='Old', state='IL')
    Record.objects.filter(pk=record_old.pk).update(created_at=now - timedelta(days=120))
    record_ten_days_ago = make_record(first_name='Mid', state='IL')
    Record.objects.filter(pk=record_ten_days_ago.pk).update(created_at=now - timedelta(days=10))
    record_recent = make_record(first_name='New', state='CA')

    response = auth_client.get('/api/stats/')
    assert response.status_code == 200

    data = response.json()
    assert data['total_records'] == 3
    assert data['records_this_week'] == 1
    assert data['records_this_month'] == 2
    assert data['distinct_states'] == 2
    assert data['by_state'][0]['state'] == 'IL'
    assert data['by_state'][0]['count'] == 2
    assert data['by_state'][1]['state'] == 'CA'
    assert data['by_state'][1]['count'] == 1
    assert data['newest_record']['first_name'] == 'New'
    assert data['newest_record']['id'] == record_recent.pk
