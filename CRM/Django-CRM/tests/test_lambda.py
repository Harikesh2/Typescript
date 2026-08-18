import json

from lambda_scoring import lambda_function
from lambda_scoring.lambda_function import (
    build_prompt,
    call_moonshot,
    extract_score,
    lambda_handler,
)


# --- build_prompt ---


def test_build_prompt_includes_all_fields_and_description():
    payload = {
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'john@example.com',
        'phone': '555-0100',
        'address': '123 Main St',
        'city': 'Springfield',
        'state': 'IL',
        'zipcode': '62701',
        'description': 'High intent',
    }
    prompt = build_prompt(payload)
    assert 'First Name: John' in prompt
    assert 'Description: High intent' in prompt
    assert 'IL' in prompt


def test_build_prompt_tolerates_missing_description():
    prompt = build_prompt({'first_name': 'Jane'})
    assert 'Description:' in prompt


# --- extract_score ---


def test_extract_score_parses_clean_json():
    data = {
        'choices': [
            {'message': {'content': '{"score": 8, "reason": "Promising lead."}'}}
        ]
    }
    assert extract_score(data) == (8, 'Promising lead.')


def test_extract_score_strips_markdown_fence():
    data = {
        'choices': [
            {
                'message': {
                    'content': '```json\n{"score": 7, "reason": "Good fit."}\n```'
                }
            }
        ]
    }
    assert extract_score(data) == (7, 'Good fit.')


def test_extract_score_defaults_reason_when_missing():
    data = {
        'choices': [{'message': {'content': '{"score": 9}'}}]
    }
    assert extract_score(data) == (9, '')


def test_extract_score_truncates_reason_to_255():
    data = {
        'choices': [
            {'message': {'content': '{"score": 5, "reason": "' + 'x' * 400 + '"}'}}
        ]
    }
    score, reason = extract_score(data)
    assert score == 5
    assert len(reason) == 255


def test_extract_score_rejects_out_of_range():
    data = {
        'choices': [
            {'message': {'content': '{"score": 11, "reason": "too high"}'}}
        ]
    }
    try:
        extract_score(data)
    except ValueError:
        return
    raise AssertionError('expected ValueError for out-of-range score')


def test_extract_score_rejects_invalid_json():
    data = {'choices': [{'message': {'content': 'not json'}}]}
    try:
        extract_score(data)
    except Exception:
        return
    raise AssertionError('expected exception for invalid JSON')


# --- call_moonshot ---


def test_call_moonshot_posts_to_api_with_bearer(monkeypatch):
    captured = {}

    def fake_post_json(url, data, headers, timeout):
        captured['url'] = url
        captured['data'] = data
        captured['headers'] = headers
        captured['timeout'] = timeout
        return {
            'choices': [
                {'message': {'content': '{"score": 8, "reason": "Promising."}'}}
            ]
        }

    monkeypatch.setenv('MOONSHOT_API_KEY', 'sk-test')
    monkeypatch.setattr(lambda_function, '_post_json', fake_post_json)

    payload = {'first_name': 'John', 'description': 'Enterprise plan'}
    assert call_moonshot(payload) == (8, 'Promising.')

    assert captured['url'] == 'https://api.moonshot.ai/v1/chat/completions'
    assert captured['data']['model'] == 'moonshot-v1-8k'
    assert captured['data']['messages'][1]['content'].startswith('First Name: John')
    assert captured['headers']['Authorization'] == 'Bearer sk-test'
    assert captured['headers']['Content-Type'] == 'application/json'
    assert captured['timeout'] == 25


# --- lambda_handler ---


def test_lambda_handler_success(monkeypatch):
    callback = {}

    def fake_call_moonshot(payload):
        return 7, 'Solid lead.'

    def fake_post_json(url, data, headers, timeout):
        callback['url'] = url
        callback['data'] = data
        callback['headers'] = headers
        callback['timeout'] = timeout
        return {}

    monkeypatch.setenv('LAMBDA_SECRET', 'sec')
    monkeypatch.setenv('DJANGO_BASE_URL', 'https://crm.example.com')
    monkeypatch.setattr(lambda_function, 'call_moonshot', fake_call_moonshot)
    monkeypatch.setattr(lambda_function, '_post_json', fake_post_json)

    event = {'body': json.dumps({'id': 42, 'first_name': 'John'})}
    result = lambda_handler(event, None)

    assert result['statusCode'] == 200
    assert json.loads(result['body'])['detail'] == 'Score submitted.'
    assert callback['url'] == 'https://crm.example.com/api/records/42/score/'
    assert callback['data'] == {'ai_score': 7, 'ai_reason': 'Solid lead.'}
    assert callback['headers']['X-Lambda-Secret'] == 'sec'
    assert callback['timeout'] == 25


def test_lambda_handler_missing_id_returns_400(monkeypatch):
    monkeypatch.setenv('LAMBDA_SECRET', 'sec')
    monkeypatch.setenv('DJANGO_BASE_URL', 'https://crm.example.com')
    event = {'body': json.dumps({'first_name': 'John'})}
    result = lambda_handler(event, None)
    assert result['statusCode'] == 400


def test_lambda_handler_missing_env_var_returns_500(monkeypatch):
    monkeypatch.delenv('DJANGO_BASE_URL', raising=False)
    monkeypatch.setenv('LAMBDA_SECRET', 'sec')
    monkeypatch.setattr(
        lambda_function,
        'call_moonshot',
        lambda payload: (5, 'reason'),
    )
    event = {'body': json.dumps({'id': 1})}
    result = lambda_handler(event, None)
    assert result['statusCode'] == 500


def test_lambda_handler_scoring_failure_returns_500(monkeypatch):
    monkeypatch.setenv('LAMBDA_SECRET', 'sec')
    monkeypatch.setenv('DJANGO_BASE_URL', 'https://crm.example.com')
    def boom(payload):
        raise RuntimeError('moonshot down')

    monkeypatch.setattr(lambda_function, 'call_moonshot', boom)
    event = {'body': json.dumps({'id': 1})}
    result = lambda_handler(event, None)
    assert result['statusCode'] == 500