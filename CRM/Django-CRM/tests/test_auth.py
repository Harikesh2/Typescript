from django.contrib.auth import get_user_model
from django.urls import resolve

from rest_framework.authtoken.models import Token


def test_register_url_resolves():
    assert resolve('/api/auth/register/').func.__module__.startswith('api.views')


def test_register_returns_201_and_token(api_client, db):
    response = api_client.post('/api/auth/register/', {
        'username': 'newuser',
        'email': 'new@example.com',
        'password': 'secretpass123',
    }, format='json')
    assert response.status_code == 201

    data = response.json()
    assert data['username'] == 'newuser'
    assert data['email'] == 'new@example.com'
    assert data['token']

    user = get_user_model().objects.get(username='newuser')
    token = Token.objects.get(user=user)
    assert data['token'] == token.key


def test_register_duplicate_username_400(api_client, db, test_user):
    response = api_client.post('/api/auth/register/', {
        'username': 'testuser',
        'email': 'other@example.com',
        'password': 'secretpass123',
    }, format='json')
    assert response.status_code == 400

    errors = response.json()
    assert 'username' in errors


def test_register_invalid_email_400(api_client, db):
    response = api_client.post('/api/auth/register/', {
        'username': 'newuser2',
        'email': 'not-an-email',
        'password': 'secretpass123',
    }, format='json')
    assert response.status_code == 400

    errors = response.json()
    assert 'email' in errors


def test_token_url_resolves():
    assert resolve('/api/auth/token/').func.__module__.startswith('rest_framework.authtoken')


def test_token_success_200(api_client, db, test_user):
    response = api_client.post('/api/auth/token/', {
        'username': 'testuser',
        'password': 'testpass123',
    }, format='json')
    assert response.status_code == 200

    data = response.json()
    assert data['token']

    token = Token.objects.get(user=test_user)
    assert data['token'] == token.key


def test_token_wrong_password_400(api_client, db, test_user):
    response = api_client.post('/api/auth/token/', {
        'username': 'testuser',
        'password': 'wrongpassword',
    }, format='json')
    assert response.status_code == 400

    errors = response.json()
    assert 'non_field_errors' in errors


def test_me_url_resolves():
    assert resolve('/api/auth/me/').func.__module__.startswith('api.views')


def test_me_anonymous_forbidden(api_client):
    response = api_client.get('/api/auth/me/')
    assert response.status_code == 401


def test_me_authenticated_returns_user(auth_client, test_user):
    response = auth_client.get('/api/auth/me/')
    assert response.status_code == 200

    data = response.json()
    assert data == {
        'id': test_user.pk,
        'username': 'testuser',
        'email': 'test@example.com',
    }


def test_me_with_token_header_200(api_client, db, test_user):
    token, _ = Token.objects.get_or_create(user=test_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    response = api_client.get('/api/auth/me/')
    assert response.status_code == 200

    data = response.json()
    assert data['username'] == 'testuser'
    assert data['email'] == 'test@example.com'