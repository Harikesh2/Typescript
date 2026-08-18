# AI Lead Scoring — AWS Lambda

Standalone Lambda that scores a CRM lead 1–10 using the Moonshot API and posts
the result back to Django's score callback endpoint.

Runtime: **Python 3.12** (stdlib `urllib.request` only — no third-party deps).
Memory: **256 MB**. Timeout: **30 s**.

## Flow

1. Django's `score-trigger` endpoint POSTs the record payload to the Lambda
   **Function URL** (`LAMBDA_FUNCTION_URL`).
2. `lambda_handler` builds a prompt from the payload (contact fields +
   `description`), calls
   `POST https://api.moonshot.ai/v1/chat/completions` (model
   `moonshot-v1-8k`), and parses `{"score": 1-10, "reason": "..."}`.
3. The Lambda POSTs `{"ai_score", "ai_reason"}` to
   `{DJANGO_BASE_URL}/api/records/<id>/score/` with the `X-Lambda-Secret`
   header. Django validates the secret, stores the score, and flips the record
   back to `IDLE`.

## Env vars

| Var | Purpose |
|-----|---------|
| `MOONSHOT_API_KEY` | Moonshot API key (`Authorization: Bearer …`) |
| `LAMBDA_SECRET` | Shared secret; must match Django's `LAMBDA_SECRET` |
| `DJANGO_BASE_URL` | Deployed Django base URL, e.g. `https://crm.example.com` |
| `MOONSHOT_API_URL` | Optional override; default `https://api.moonshot.ai/v1/chat/completions` |
| `MOONSHOT_MODEL` | Optional override; default `moonshot-v1-8k` |

## Deploy (Lambda console)

1. Create a function: runtime **Python 3.12**, architecture **x86_64**.
2. Zip the contents of this folder (`lambda_function.py`, `requirements.txt`)
   and upload, or paste `lambda_function.py` in the inline editor.
3. Handler: `lambda_function.lambda_handler`.
4. Set **Memory 256 MB**, **Timeout 30 s**, and the env vars above.
5. Add a **Function URL** with auth **NONE** (D-41 — the callback is gated by
   `LAMBDA_SECRET`, not the Function URL auth).
6. Copy the Function URL into Django's `LAMBDA_FUNCTION_URL`.

## Test locally

```sh
export MOONSHOT_API_KEY=sk-…
export LAMBDA_SECRET=…
export DJANGO_BASE_URL=http://localhost:8000
python3 lambda_function.py
```

Or with a Lambda console **test event**:

```json
{
  "body": "{\"id\": 1, \"first_name\": \"John\", \"last_name\": \"Doe\", \"email\": \"john@example.com\", \"phone\": \"555-0100\", \"address\": \"123 Main St\", \"city\": \"Springfield\", \"state\": \"IL\", \"zipcode\": \"62701\", \"description\": \"Interested in the enterprise plan.\"}"
}
```

## Failure behavior

If Moonshot, parsing, or the callback POST fails, the handler returns 500 and
the record stays `PROCESSING`. The frontend's 60 s polling timeout then offers
a Retry that calls `reset-scoring`, which un-sticks the lock (D-49/D-42).