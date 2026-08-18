import json
import logging
import os
import re
import urllib.request

logger = logging.getLogger()
logger.setLevel(logging.INFO)

MOONSHOT_API_URL = os.environ.get(
    'MOONSHOT_API_URL', 'https://api.moonshot.ai/v1/chat/completions'
)
MOONSHOT_MODEL = os.environ.get('MOONSHOT_MODEL', 'moonshot-v1-8k')

PROMPT_FIELDS = (
    'first_name',
    'last_name',
    'email',
    'phone',
    'address',
    'city',
    'state',
    'zipcode',
    'description',
)


def build_prompt(payload):
    lines = [f'{field.replace("_", " ").title()}: {payload.get(field, "")}' for field in PROMPT_FIELDS]
    return '\n'.join(lines)


def build_request_payload(prompt):
    return {
        'model': MOONSHOT_MODEL,
        'messages': [
            {
                'role': 'system',
                'content': (
                    'You are a sales lead scorer. Rate the CRM lead below on a scale '
                    'of 1 to 10 (10 = most promising). Reply with JSON only, no extra '
                    'text: {"score": <int 1-10>, "reason": "<one sentence, max 255 chars>"}'
                ),
            },
            {'role': 'user', 'content': prompt},
        ],
        'temperature': 0,
    }


def _post_json(url, data, headers, timeout):
    request = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers=headers,
        method='POST',
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode('utf-8'))


def extract_score(data):
    content = data['choices'][0]['message']['content'].strip()
    fence = re.match(r'```(?:json)?\s*(.*?)\s*```', content, re.DOTALL)
    if fence:
        content = fence.group(1).strip()
    parsed = json.loads(content)
    score = int(parsed['score'])
    if not 1 <= score <= 10:
        raise ValueError('Moonshot returned a score outside 1-10')
    reason = str(parsed.get('reason') or '')[:255]
    return score, reason


def call_moonshot(payload):
    body = build_request_payload(build_prompt(payload))
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f"Bearer {os.environ['MOONSHOT_API_KEY']}",
    }
    data = _post_json(MOONSHOT_API_URL, body, headers, timeout=25)
    return extract_score(data)


def lambda_handler(event, context):
    try:
        payload = json.loads(event['body'])
        record_id = payload.get('id')
        if record_id is None:
            return {
                'statusCode': 400,
                'body': json.dumps({'detail': 'Missing record id in payload.'}),
            }

        score, reason = call_moonshot(payload)

        callback_url = (
            f"{os.environ['DJANGO_BASE_URL'].rstrip('/')}/api/records/{record_id}/score/"
        )
        _post_json(
            callback_url,
            {'ai_score': score, 'ai_reason': reason},
            {
                'Content-Type': 'application/json',
                'X-Lambda-Secret': os.environ['LAMBDA_SECRET'],
            },
            timeout=25,
        )
        return {'statusCode': 200, 'body': json.dumps({'detail': 'Score submitted.'})}
    except KeyError as exc:
        logger.exception('Missing environment variable %s', exc)
        return {
            'statusCode': 500,
            'body': json.dumps({'detail': f'Missing environment variable: {exc}'}),
        }
    except Exception:
        logger.exception('Lead scoring failed')
        return {
            'statusCode': 500,
            'body': json.dumps({'detail': 'Scoring failed.'}),
        }


if __name__ == '__main__':
    test_event = {
        'body': json.dumps(
            {
                'id': 1,
                'first_name': 'John',
                'last_name': 'Doe',
                'email': 'john@example.com',
                'phone': '555-0100',
                'address': '123 Main St',
                'city': 'Springfield',
                'state': 'IL',
                'zipcode': '62701',
                'description': 'Interested in the enterprise plan.',
            }
        )
    }
    print(json.dumps(lambda_handler(test_event, None)))