from django.conf import settings
from django.urls import resolve


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