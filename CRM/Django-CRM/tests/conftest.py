import pytest
from rest_framework.test import APIClient

from website.models import Record


@pytest.fixture
def test_user(db, django_user_model):
    user = django_user_model.objects.create_user(
        username='testuser',
        password='testpass123',
        email='test@example.com',
    )
    return user


@pytest.fixture
def make_record(db):
    def _make(**overrides):
        defaults = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john@example.com',
            'phone': '555-0100',
            'address': '123 Main St',
            'city': 'Springfield',
            'state': 'IL',
            'zipcode': '62701',
        }
        defaults.update(overrides)
        return Record.objects.create(**defaults)

    return _make


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def auth_client(api_client, test_user):
    api_client.force_authenticate(user=test_user)
    return api_client