import json
import logging
import threading
import urllib.request

from django.conf import settings


logger = logging.getLogger(__name__)

PAYLOAD_FIELDS = (
    'id',
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


def build_payload(record):
    return {field: getattr(record, field) for field in PAYLOAD_FIELDS}


def trigger_lead_scoring(record):
    url = settings.LAMBDA_FUNCTION_URL
    if not url:
        logger.warning(
            'LAMBDA_FUNCTION_URL not set; skipping lead-scoring trigger for record %s',
            record.pk,
        )
        return
    thread = threading.Thread(
        target=_post_to_lambda,
        args=(url, build_payload(record), settings.LAMBDA_SECRET),
        daemon=True,
    )
    thread.start()


def _post_to_lambda(url, payload, secret):
    try:
        request = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'X-Lambda-Secret': secret,
            },
            method='POST',
        )
        with urllib.request.urlopen(request, timeout=35):
            pass
    except Exception:
        logger.exception('Lead-scoring Lambda request failed for payload %r', payload)