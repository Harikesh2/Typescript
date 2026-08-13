# Django CRM — DRF JSON API

Django 4.1 CRM backed by MySQL, with an additive Django REST Framework JSON API secured by DRF **Token Authentication**. The existing HTML `website` app is untouched; the API lives in the separate `api` app under `/api/`.

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

Writes require DRF Token auth (`HTTP_AUTHORIZATION: Token <key>`); reads are public. `/api/stats/`, `/api/reports/`, and `/api/auth/me/` require token auth.

## Quick start

```bash
python -m pytest          # run test suite (in-memory SQLite, never touches MySQL)
python manage.py runserver
```

Visit the browsable API root at `http://localhost:8000/api/`.

## Testing

pytest + pytest-django; root `tests/` package. The test suite switches the DB to in-memory SQLite automatically, so no local MySQL is needed to run tests.