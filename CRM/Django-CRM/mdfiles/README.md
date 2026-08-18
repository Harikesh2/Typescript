# Django CRM — DRF JSON API

Django 4.1 CRM backed by PostgreSQL (D-24), with an additive Django REST Framework JSON API secured by DRF **Token Authentication**. The `website` app hosts the `Record` model, admin, DB-schema checks, and the healthcheck command; the JSON API lives in the separate `api` app under `/api/`. The legacy server-rendered UI was removed (D-35).

Docs: [FEATURES.md](FEATURES.md) (features implemented) · [PLAN.md](PLAN.md) (current working plan)

## API surface

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/records/` | public read | List records; `?search=`, `?state=`, `?ordering=`, opt-in `?page=` |
| POST | `/api/records/` | token required | Create record |
| GET | `/api/records/<pk>/` | public read | Record detail |
| PUT/PATCH | `/api/records/<pk>/` | token required | Full / partial update |
| DELETE | `/api/records/<pk>/` | token required | Delete record |
| GET | `/api/stats/` | token required | Dashboard aggregates (total, week, month, states) |
| GET | `/api/reports/` | token required | Report aggregates: `records_per_month`, `by_state`, `total_records`; `?from=`/`?to=` range filter |
| POST | `/api/auth/register/` | public | Create user, returns token |
| GET | `/api/auth/me/` | token required | Current user `{id, username, email}` |
| POST | `/api/auth/token/` | public | Obtain token (username/password) |
| POST | `/api/records/<pk>/score-trigger/` | token required | Start AI scoring: `202`; `409` if already processing; `400` if no changes since last score |
| POST | `/api/records/<pk>/reset-scoring/` | token required | Clear the `PROCESSING` lock (`200`) so a timed-out score can be retried |
| PATCH | `/api/records/<pk>/score/` | Lambda callback (shared secret) | Write `ai_score`/`ai_reason`/`ai_scored_at`, reset status to `IDLE` |

Writes require DRF Token auth (`HTTP_AUTHORIZATION: Token <key>`); reads are public. `/api/stats/`, `/api/reports/`, and `/api/auth/me/` require token auth. The `/api/records/<pk>/score/` callback is called by the AWS Lambda scoring function and is gated by the `LAMBDA_SECRET` header (not a user token, D-41).

## AI Lead Scoring

Records carry optional scoring fields (`description`, `ai_score`, `ai_reason`, `ai_scored_at`, `scoring_status`) plus `updated_at`. A manual `score-trigger` locks the record (`PROCESSING`, concurrent triggers → 409) and forwards it to an AWS Lambda that asks Moonshot for a 1–10 score + one-sentence reason, then POSTs the result back to the `score/` callback. A `reset-scoring` endpoint un-sticks the lock after a timeout.

Environment variables (see `.env.example`): `LAMBDA_FUNCTION_URL`, `LAMBDA_SECRET`, `DJANGO_BASE_URL` (the base URL Lambda uses for the callback); the Lambda additionally needs `MOONSHOT_API_KEY` (+ optional `MOONSHOT_API_URL`/`MOONSHOT_MODEL`, see `lambda_scoring/README.md`). Status: **implemented** — Phases 0–5 done, see [PLAN.md](PLAN.md) (deploy = Phase 6).

## Quick start

```bash
python -m pytest          # run test suite (in-memory SQLite, never touches the runtime DB)
python manage.py runserver
```

Visit the browsable API root at `http://localhost:8000/api/`.

## Testing

pytest + pytest-django; root `tests/` package. The test suite switches the DB to in-memory SQLite automatically, so no local database is needed to run tests.