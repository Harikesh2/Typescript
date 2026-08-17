import json

from django.test import override_settings
from django.urls import resolve
from rest_framework.test import APIClient

from api import views
from api.lambda_trigger import _post_to_lambda, build_payload, trigger_lead_scoring
from website.models import Record


def test_score_trigger_url_resolves():
    assert resolve('/api/records/1/score-trigger/').func.__module__.startswith('api.views')


def test_score_callback_url_resolves():
    assert resolve('/api/records/1/score/').func.__module__.startswith('api.views')


def test_reset_scoring_url_resolves():
    assert resolve('/api/records/1/reset-scoring/').func.__module__.startswith('api.views')


def test_description_writable_on_create(auth_client):
    response = auth_client.post('/api/records/', {
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'john@example.com',
        'phone': '555-0100',
        'address': '123 Main St',
        'city': 'Springfield',
        'state': 'IL',
        'zipcode': '62701',
        'description': 'Interested in the enterprise plan.',
    })
    assert response.status_code == 201
    assert response.json()['description'] == 'Interested in the enterprise plan.'


def test_description_updatable_on_patch(auth_client, make_record):
    record = make_record()
    response = auth_client.patch(f'/api/records/{record.pk}/', {
        'description': 'Followed up twice, still engaged.',
    })
    assert response.status_code == 200
    assert response.json()['description'] == 'Followed up twice, still engaged.'


def test_scoring_status_defaults_to_idle(auth_client, make_record):
    record = make_record()
    response = auth_client.get(f'/api/records/{record.pk}/')
    assert response.status_code == 200
    data = response.json()
    assert data['scoring_status'] == 'IDLE'
    assert data['ai_score'] is None
    assert data['ai_reason'] is None
    assert data['ai_scored_at'] is None


def test_score_fields_read_only_on_create(auth_client):
    response = auth_client.post('/api/records/', {
        'first_name': 'Jane',
        'last_name': 'Smith',
        'email': 'jane@example.com',
        'phone': '555-0101',
        'address': '456 Oak Ave',
        'city': 'Chicago',
        'state': 'IL',
        'zipcode': '60601',
        'ai_score': 9,
        'ai_reason': 'forged reason',
        'ai_scored_at': '2026-01-01T00:00:00Z',
        'scoring_status': 'PROCESSING',
    })
    assert response.status_code == 201
    data = response.json()
    assert data['ai_score'] is None
    assert data['ai_reason'] is None
    assert data['ai_scored_at'] is None
    assert data['scoring_status'] == 'IDLE'


def test_score_fields_read_only_on_patch(auth_client, make_record):
    record = make_record()
    response = auth_client.patch(f'/api/records/{record.pk}/', {
        'ai_score': 7,
        'ai_reason': 'forged reason',
        'scoring_status': 'PROCESSING',
    })
    assert response.status_code == 200
    record.refresh_from_db()
    assert record.ai_score is None
    assert record.ai_reason is None
    assert record.scoring_status == 'IDLE'


def test_updated_at_present_and_auto_managed(auth_client, make_record):
    record = make_record()
    response = auth_client.get(f'/api/records/{record.pk}/')
    assert response.status_code == 200
    assert 'updated_at' in response.json()
    assert response.json()['updated_at'] == record.updated_at.isoformat().replace('+00:00', 'Z')


def test_updated_at_changes_after_patch(auth_client, make_record):
    record = make_record()
    first = record.updated_at
    response = auth_client.patch(f'/api/records/{record.pk}/', {
        'description': 'updated after scoring attempt',
    })
    assert response.status_code == 200
    record.refresh_from_db()
    assert record.updated_at > first


def test_updated_at_not_client_settable(auth_client, make_record):
    record = make_record()
    response = auth_client.patch(f'/api/records/{record.pk}/', {
        'updated_at': '2020-01-01T00:00:00Z',
        'description': 'still here',
    })
    assert response.status_code == 200
    record.refresh_from_db()
    assert record.updated_at.year != 2020


# --- score-trigger ---


def test_score_trigger_returns_202_and_marks_processing(auth_client, make_record, monkeypatch):
    record = make_record()
    called = []
    monkeypatch.setattr(views, 'trigger_lead_scoring', lambda rec: called.append(rec))
    response = auth_client.post(f'/api/records/{record.pk}/score-trigger/')
    assert response.status_code == 202
    assert response.json()['detail'] == 'Scoring started.'
    record.refresh_from_db()
    assert record.scoring_status == 'PROCESSING'
    assert called == [record]


def test_score_trigger_returns_409_when_processing(auth_client, make_record, monkeypatch):
    record = make_record(scoring_status='PROCESSING')
    monkeypatch.setattr(views, 'trigger_lead_scoring', lambda rec: None)
    response = auth_client.post(f'/api/records/{record.pk}/score-trigger/')
    assert response.status_code == 409
    assert response.json()['detail'] == 'Scoring already in progress.'
    record.refresh_from_db()
    assert record.scoring_status == 'PROCESSING'


def test_score_trigger_returns_400_when_no_changes(auth_client, make_record, monkeypatch):
    record = make_record()
    Record.objects.filter(pk=record.pk).update(
        ai_score=8, ai_reason='promising lead', scoring_status='IDLE'
    )
    record.refresh_from_db()
    Record.objects.filter(pk=record.pk).update(ai_scored_at=record.updated_at)
    monkeypatch.setattr(views, 'trigger_lead_scoring', lambda rec: None)
    response = auth_client.post(f'/api/records/{record.pk}/score-trigger/')
    assert response.status_code == 400
    assert response.json()['detail'] == 'No changes detected. Edit the lead to re-score.'
    record.refresh_from_db()
    assert record.scoring_status == 'IDLE'


def test_score_trigger_returns_202_after_edit(auth_client, make_record, monkeypatch):
    record = make_record()
    Record.objects.filter(pk=record.pk).update(
        ai_score=8, ai_reason='promising lead', scoring_status='IDLE'
    )
    record.refresh_from_db()
    Record.objects.filter(pk=record.pk).update(ai_scored_at=record.updated_at)
    auth_client.patch(f'/api/records/{record.pk}/', {'description': 'edited after scoring'})
    monkeypatch.setattr(views, 'trigger_lead_scoring', lambda rec: None)
    response = auth_client.post(f'/api/records/{record.pk}/score-trigger/')
    assert response.status_code == 202
    record.refresh_from_db()
    assert record.scoring_status == 'PROCESSING'


def test_score_trigger_missing_record_returns_404(auth_client):
    response = auth_client.post('/api/records/99999/score-trigger/')
    assert response.status_code == 404


# --- reset-scoring ---


def test_reset_scoring_clears_processing_lock(auth_client, make_record):
    record = make_record(scoring_status='PROCESSING')
    response = auth_client.post(f'/api/records/{record.pk}/reset-scoring/')
    assert response.status_code == 200
    record.refresh_from_db()
    assert record.scoring_status == 'IDLE'


def test_reset_scoring_idempotent_when_idle(auth_client, make_record):
    record = make_record()
    response = auth_client.post(f'/api/records/{record.pk}/reset-scoring/')
    assert response.status_code == 200
    record.refresh_from_db()
    assert record.scoring_status == 'IDLE'


def test_reset_scoring_keeps_existing_score(auth_client, make_record):
    record = make_record(ai_score=8, scoring_status='PROCESSING')
    response = auth_client.post(f'/api/records/{record.pk}/reset-scoring/')
    assert response.status_code == 200
    record.refresh_from_db()
    assert record.ai_score == 8
    assert record.scoring_status == 'PROCESSING'


def test_reset_scoring_missing_record_returns_404(auth_client):
    response = auth_client.post('/api/records/99999/reset-scoring/')
    assert response.status_code == 404


# --- score callback (Lambda) ---


def test_score_callback_rejects_wrong_secret(make_record):
    record = make_record()
    response = APIClient().patch(
        f'/api/records/{record.pk}/score/',
        {'ai_score': 8},
        HTTP_X_LAMBDA_SECRET='wrong-secret',
    )
    assert response.status_code == 401


@override_settings(LAMBDA_SECRET='test-secret')
def test_score_callback_requires_secret_header(make_record):
    record = make_record()
    response = APIClient().patch(
        f'/api/records/{record.pk}/score/',
        {'ai_score': 8},
    )
    assert response.status_code == 401


@override_settings(LAMBDA_SECRET='test-secret')
def test_score_callback_accepts_valid_secret(api_client, make_record):
    record = make_record(scoring_status='PROCESSING')
    response = api_client.patch(
        f'/api/records/{record.pk}/score/',
        {'ai_score': 8, 'ai_reason': 'promising lead'},
        HTTP_X_LAMBDA_SECRET='test-secret',
    )
    assert response.status_code == 200
    record.refresh_from_db()
    assert record.ai_score == 8
    assert record.ai_reason == 'promising lead'
    assert record.scoring_status == 'IDLE'
    assert record.ai_scored_at == record.updated_at


@override_settings(LAMBDA_SECRET='test-secret')
def test_score_callback_rejects_out_of_range_score(api_client, make_record):
    record = make_record()
    for bad_score in (11, 0, 'abc'):
        response = api_client.patch(
            f'/api/records/{record.pk}/score/',
            {'ai_score': bad_score},
            HTTP_X_LAMBDA_SECRET='test-secret',
        )
        assert response.status_code == 400
    record.refresh_from_db()
    assert record.ai_score is None
    assert record.scoring_status == 'IDLE'


@override_settings(LAMBDA_SECRET='test-secret')
def test_score_callback_missing_record_returns_404(api_client, db):
    response = api_client.patch(
        '/api/records/99999/score/',
        {'ai_score': 8},
        HTTP_X_LAMBDA_SECRET='test-secret',
    )
    assert response.status_code == 404


def test_scoring_endpoints_require_auth(api_client, make_record):
    record = make_record()
    assert api_client.post(f'/api/records/{record.pk}/score-trigger/').status_code == 401
    assert api_client.patch(f'/api/records/{record.pk}/score/').status_code == 401
    assert api_client.post(f'/api/records/{record.pk}/reset-scoring/').status_code == 401


# --- lambda_trigger module ---


def test_build_payload_includes_contact_and_description(make_record):
    record = make_record(description='High intent', email='lead@example.com')
    payload = build_payload(record)
    assert payload['id'] == record.pk
    assert payload['first_name'] == 'John'
    assert payload['email'] == 'lead@example.com'
    assert payload['description'] == 'High intent'
    assert 'scoring_status' not in payload


@override_settings(LAMBDA_FUNCTION_URL='', LAMBDA_SECRET='')
def test_trigger_lead_scoring_noop_without_url(make_record):
    record = make_record()
    trigger_lead_scoring(record)


def test_post_to_lambda_sends_payload_and_secret(monkeypatch, make_record):
    record = make_record(description='High intent')
    captured = {}

    def fake_urlopen(request, timeout=None):
        captured['request'] = request
        captured['timeout'] = timeout

        class FakeResponse:
            def __enter__(self):
                return self

            def __exit__(self, *args):
                return False

        return FakeResponse()

    monkeypatch.setattr('api.lambda_trigger.urllib.request.urlopen', fake_urlopen)
    _post_to_lambda('https://lambda.example/', build_payload(record), 'topsecret')

    request = captured['request']
    assert request.full_url == 'https://lambda.example/'
    assert request.get_method() == 'POST'
    assert json.loads(request.data)['description'] == 'High intent'
    assert request.get_header('X-lambda-secret') == 'topsecret'
    assert captured['timeout'] == 35