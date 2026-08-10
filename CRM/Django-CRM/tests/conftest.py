import pytest
from rest_framework.test import APIClient


@pytest.fixture
def test_user(db, django_user_model):
    user = django_user_model.objects.create_user(
        username='testuser',
        password='testpass123',
        email='test@example.com',
    )
    return user


@pytest.fixture
def api_client():
    return APIClient()