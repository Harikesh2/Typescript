from django.conf import settings
from django.urls import resolve

from rest_framework.authtoken.models import Token

from website.models import Record


def test_records_test_module_collects():
    assert True


def test_api_app_registered():
    assert 'api' in settings.INSTALLED_APPS
    assert 'rest_framework' in settings.INSTALLED_APPS
    assert 'rest_framework.authtoken' in settings.INSTALLED_APPS


def test_api_root_responds(api_client):
    response = api_client.get('/api/')
    assert response.status_code == 200


def test_api_root_resolves():
    assert resolve('/api/').func.__module__.startswith('rest_framework.routers')


def test_records_detail_url_resolves():
    assert resolve('/api/records/1/').func.__module__.startswith('api.views')


def test_records_detail_returns_200(api_client, db):
    record = Record.objects.create(
        first_name='John',
        last_name='Doe',
        email='john@example.com',
        phone='555-0100',
        address='123 Main St',
        city='Springfield',
        state='IL',
        zipcode='62701',
    )

    response = api_client.get(f'/api/records/{record.pk}/')
    assert response.status_code == 200

    data = response.json()
    assert data['id'] == record.pk
    assert 'created_at' in data
    assert {
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'john@example.com',
        'phone': '555-0100',
        'address': '123 Main St',
        'city': 'Springfield',
        'state': 'IL',
        'zipcode': '62701',
    }.items() <= data.items()


def test_records_detail_missing_pk_404(api_client, db):
    response = api_client.get('/api/records/999999/')
    assert response.status_code == 404


def test_records_detail_invalid_pk_404(api_client):
    response = api_client.get('/api/records/abc/')
    assert response.status_code == 404


def test_records_delete_returns_204_and_removes(auth_client, db):
    record = Record.objects.create(
        first_name='John',
        last_name='Doe',
        email='john@example.com',
        phone='555-0100',
        address='123 Main St',
        city='Springfield',
        state='IL',
        zipcode='62701',
    )

    response = auth_client.delete(f'/api/records/{record.pk}/')
    assert response.status_code == 204
    assert not Record.objects.filter(pk=record.pk).exists()


def test_records_delete_missing_pk_404(auth_client, db):
    response = auth_client.delete('/api/records/999999/')
    assert response.status_code == 404


def test_records_delete_anonymous_forbidden(api_client, db):
    record = Record.objects.create(
        first_name='John',
        last_name='Doe',
        email='john@example.com',
        phone='555-0100',
        address='123 Main St',
        city='Springfield',
        state='IL',
        zipcode='62701',
    )

    response = api_client.delete(f'/api/records/{record.pk}/')
    assert response.status_code == 403
    assert Record.objects.filter(pk=record.pk).exists()


def test_records_full_put_updates_200(auth_client, db):
    record = Record.objects.create(
        first_name='John',
        last_name='Doe',
        email='john@example.com',
        phone='555-0100',
        address='123 Main St',
        city='Springfield',
        state='IL',
        zipcode='62701',
    )

    payload = {
        'first_name': 'Jane',
        'last_name': 'Smith',
        'email': 'jane@example.com',
        'phone': '555-0199',
        'address': '456 Oak Ave',
        'city': 'Chicago',
        'state': 'IL',
        'zipcode': '60601',
    }
    response = auth_client.put(f'/api/records/{record.pk}/', payload, format='json')
    assert response.status_code == 200

    data = response.json()
    assert data['id'] == record.pk
    for field, value in payload.items():
        assert data[field] == value

    record.refresh_from_db()
    assert record.first_name == 'Jane'
    assert record.last_name == 'Smith'
    assert record.zipcode == '60601'


def test_records_partial_patch_updates_200(auth_client, db):
    record = Record.objects.create(
        first_name='John',
        last_name='Doe',
        email='john@example.com',
        phone='555-0100',
        address='123 Main St',
        city='Springfield',
        state='IL',
        zipcode='62701',
    )

    response = auth_client.patch(f'/api/records/{record.pk}/', {'phone': '555-0555'}, format='json')
    assert response.status_code == 200

    data = response.json()
    assert data['phone'] == '555-0555'
    assert data['first_name'] == 'John'
    assert data['last_name'] == 'Doe'
    assert data['email'] == 'john@example.com'
    assert data['address'] == '123 Main St'
    assert data['city'] == 'Springfield'
    assert data['state'] == 'IL'
    assert data['zipcode'] == '62701'

    record.refresh_from_db()
    assert record.phone == '555-0555'


def test_records_put_missing_fields_400(auth_client, db):
    record = Record.objects.create(
        first_name='John',
        last_name='Doe',
        email='john@example.com',
        phone='555-0100',
        address='123 Main St',
        city='Springfield',
        state='IL',
        zipcode='62701',
    )

    response = auth_client.put(f'/api/records/{record.pk}/', {'first_name': 'Jane'}, format='json')
    assert response.status_code == 400

    errors = response.json()
    for field in ('last_name', 'email', 'phone', 'address', 'city', 'state', 'zipcode'):
        assert field in errors


def test_records_list_url_resolves():
    assert resolve('/api/records/').func.__module__.startswith('api.views')


def test_records_list_empty(api_client, db):
    response = api_client.get('/api/records/')
    assert response.status_code == 200
    assert response.json() == []


def test_records_list_returns_seeded(api_client, db):
    Record.objects.create(
        first_name='John',
        last_name='Doe',
        email='john@example.com',
        phone='555-0100',
        address='123 Main St',
        city='Springfield',
        state='IL',
        zipcode='62701',
    )
    Record.objects.create(
        first_name='Jane',
        last_name='Smith',
        email='jane@example.com',
        phone='555-0101',
        address='456 Oak Ave',
        city='Chicago',
        state='IL',
        zipcode='60601',
    )

    response = api_client.get('/api/records/')
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 2

    expected_fields = {
        'id', 'created_at', 'first_name', 'last_name', 'email',
        'phone', 'address', 'city', 'state', 'zipcode',
    }
    assert set(data[0].keys()) == expected_fields
    records = sorted(data, key=lambda r: r['first_name'])
    assert {
        'first_name': 'Jane',
        'last_name': 'Smith',
        'email': 'jane@example.com',
        'phone': '555-0101',
        'address': '456 Oak Ave',
        'city': 'Chicago',
        'state': 'IL',
        'zipcode': '60601',
    }.items() <= records[0].items()


def test_records_create_anonymous_forbidden(api_client, db):
    response = api_client.post('/api/records/', {'first_name': 'Bogus'})
    assert response.status_code == 403


def test_records_create_returns_201(auth_client, db):
    payload = {
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'john@example.com',
        'phone': '555-0100',
        'address': '123 Main St',
        'city': 'Springfield',
        'state': 'IL',
        'zipcode': '62701',
    }
    response = auth_client.post('/api/records/', payload, format='json')
    assert response.status_code == 201

    data = response.json()
    assert data['id'] > 0
    assert 'created_at' in data
    for field, value in payload.items():
        assert data[field] == value

    record = Record.objects.get(pk=data['id'])
    assert record.first_name == 'John'
    assert record.zipcode == '62701'


def test_records_create_with_token_header_201(api_client, db, test_user):
    token, _ = Token.objects.get_or_create(user=test_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    payload = {
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'john@example.com',
        'phone': '555-0100',
        'address': '123 Main St',
        'city': 'Springfield',
        'state': 'IL',
        'zipcode': '62701',
    }
    response = api_client.post('/api/records/', payload, format='json')
    assert response.status_code == 201

    data = response.json()
    assert data['id'] > 0
    assert data['first_name'] == 'John'


def test_records_create_missing_fields_400(auth_client, db):
    response = auth_client.post('/api/records/', {'first_name': 'John'}, format='json')
    assert response.status_code == 400

    errors = response.json()
    for field in ('last_name', 'email', 'phone', 'address', 'city', 'state', 'zipcode'):
        assert field in errors


def test_records_list_search_filters_by_name(api_client, db, make_record):
    make_record(first_name='John')
    make_record(first_name='Jane', email='jane@example.com')

    response = api_client.get('/api/records/', {'search': 'John'})
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]['first_name'] == 'John'


def test_records_list_search_filters_by_email(api_client, db, make_record):
    make_record()
    make_record(first_name='Jane', email='jane@example.com')

    response = api_client.get('/api/records/', {'search': 'jane@example.com'})
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 1
    assert data[0]['email'] == 'jane@example.com'


def test_records_list_state_filter(api_client, db, make_record):
    make_record(state='IL')
    make_record(first_name='Jane', state='CA')

    response = api_client.get('/api/records/', {'state': 'CA'})
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 1
    assert data[0]['state'] == 'CA'


def test_records_list_state_filter_case_insensitive(api_client, db, make_record):
    make_record(state='IL')
    make_record(first_name='Jane', state='CA')

    response = api_client.get('/api/records/', {'state': 'ca'})
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 1
    assert data[0]['state'] == 'CA'


def test_records_list_ordering(api_client, db, make_record):
    make_record(first_name='John')
    make_record(first_name='Jane')

    response = api_client.get('/api/records/', {'ordering': '-first_name'})
    assert response.status_code == 200

    data = response.json()
    assert [r['first_name'] for r in data] == ['John', 'Jane']


def test_records_list_page_param_returns_paginated(api_client, db, make_record):
    make_record()
    make_record(first_name='Jane')
    make_record(first_name='Bob')

    response = api_client.get('/api/records/', {'page': '1'})
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, dict)
    assert data['count'] == 3
    assert len(data['results']) == 3
    assert data['next'] is None
    assert data['previous'] is None
    assert set(data.keys()) == {'count', 'next', 'previous', 'results'}


def test_records_list_page_size_param(api_client, db, make_record):
    make_record()
    make_record(first_name='Jane')
    make_record(first_name='Bob')

    response = api_client.get('/api/records/', {'page': '1', 'page_size': '2'})
    assert response.status_code == 200

    data = response.json()
    assert data['count'] == 3
    assert len(data['results']) == 2
    assert data['next'] is not None