# PLAN — DRF REST API on Django CRM

Goal: add a Django REST Framework (DRF) JSON API layer on top of the existing Django CRM, secured with DRF Token Authentication, fully covered by pytest tests, and gated by CI/CD.

## Repo analysis (findings)

- Stack: Django 4.1, Python 3.12, MySQL (`mysqlclient`), gunicorn + whitenoise, docker-compose, deployed on Railway.
  - `dcrm/settings.py` — project settings (MySQL via env vars, whitenoise static storage).
  - `requirements.txt` — `django>=4.1`, `mysqlclient`, `gunicorn`, `whitenoise`.
- `website` app (existing, HTML CRM):
  - `website/models.py:4` — `Record` model (name/contact/address/created_at). **No model changes planned → no new migrations.**
  - `website/views.py` — auth (login/logout/register) + full CRUD via function views.
  - `website/forms.py`, `website/urls.py`, Bootstrap templates.
- Tests:
  - `website/tests.py` exists but is an empty placeholder — **we will not use it**. Tests live in a root `tests/` folder instead.
  - No test runner configured (no pytest), no CI/CD, no `.github/`.

## Test framework decisions

- **pytest + pytest-django**; SQLite test database; runs via `python -m pytest`.
- Root `tests/` package (not inside any app):
  - `tests/__init__.py`
  - `tests/conftest.py` — shared fixtures (test user, auth token, API client)
  - `tests/test_auth.py` — auth endpoint tests
  - `tests/test_records.py` — CRUD endpoint tests
- `pytest.ini` at project root: `DJANGO_SETTINGS_MODULE = dcrm.settings`, `python_files = tests/*.py`.
- Do not use `website/tests.py`.

## API decisions

- DRF **Token Authentication** (built-in `rest_framework.authtoken`, no JWT, no extra deps).
- New **`api` app** (separate from `website`).
- All endpoints under `/api/`:
  - `/api/records/` — list (GET), create (POST)
  - `/api/records/<pk>/` — retrieve (GET), update (PUT/PATCH), delete (DELETE)
  - `/api/auth/register/` — register user, returns token
  - `/api/auth/token/` — obtain token (`obtain_auth_token`)
- Permissions: `IsAuthenticatedOrReadOnly` + `TokenAuthentication` on records.

## CI/CD

- `.github/workflows/ci.yml`:
  - Runs pytest on every **push** and every **pull request to `main`**.
  - Python 3.12, install dependencies, `python -m pytest`.
- No commits per phase — the user handles committing / repo hygiene.

---

## Phases

Each phase = one small, independently verifiable change. Mark phase **completed** in the todo tracker before moving to the next.

### Phase 0 — Test scaffold — **COMPLETED**
Create the baseline test harness so every later phase has a CI gate:
- Add `pytest`, `pytest-django` to `requirements.txt`.
- Add `pytest.ini` at project root (`DJANGO_SETTINGS_MODULE = dcrm.settings`, `python_files = tests/*.py`, SQLite test DB config).
- Create root `tests/` package: `__init__.py`, `conftest.py` (shared fixtures: test user, auth `Token`, API client), `test_auth.py`, `test_records.py` (placeholder tests so pytest passes).
- Add `.github/workflows/ci.yml` — pytest on push + PR to `main`.
- Gate: `python -m pytest` passes; CI workflow exists.

### Phase 1 — DRF bootstrap — **COMPLETED**
No features yet, just DRF wired up and reachable:
- Add `djangorestframework` to `requirements.txt`.
- Add `rest_framework`, `rest_framework.authtoken`, `api` to `INSTALLED_APPS` in `dcrm/settings.py`.
- Add `REST_FRAMEWORK` default config (TokenAuthentication, `IsAuthenticatedOrReadOnly`).
- Create `api` app (apps.py, empty urls/serializers/views).
- Wire `path('api/', include('api.urls'))` in `dcrm/urls.py`.
- Tests: `/api/` auto-generated API root responds; app registered in `INSTALLED_APPS`.

### Phase 2 — GET /api/records/ (list) — **COMPLETED**
- `RecordSerializer` (all fields, `created_at` read-only).
- `ListCreateRecordAPIView` registered at `/api/records/` (only GET path in scope).
- Tests: empty list → `[]`; seeded records → JSON array with correct fields.

### Phase 3 — POST /api/records/ (create) — **COMPLETED**
- Enable create on the list view.
- Tests: valid create → 201 + object returned; missing/invalid fields → 400 with validation errors.

### Phase 4 — GET /api/records/<pk>/ (detail) — **COMPLETED**
- `RetrieveUpdateDestroyRecordAPIView` registered at `/api/records/<pk>/`, GET only in scope.
- Tests: existing pk → 200 with full object; missing pk → 404; invalid pk type → 404.

### Phase 5 — PUT/PATCH /api/records/<pk>/ (update) — **COMPLETED**
- Enable update on the detail view.
- Tests: full PUT → 200 updated; partial PATCH → 200 partial; missing required fields → 400 (the planned "unknown field → 400" case is met by missing-required-field 400, since DRF ignores unknown keys by default).

### Phase 6 — DELETE /api/records/<pk>/ (delete) — **COMPLETED**
- Enable delete on the detail view.
- Tests: delete → 204 (object gone); delete again → 404.

### Phase 7 — POST /api/auth/register/ — **COMPLETED**
- `RegisterAPIView` → creates user + auth token.
- Tests: valid → 201 + token returned; duplicate username → 400; bad email → 400.

### Phase 8 — POST /api/auth/token/ (obtain token) — **COMPLETED**
- `obtain_auth_token` at `/api/auth/token/`.
- Tests: correct credentials → 200 + token; wrong password → 400/401.

### Phase 9 — Permission locking — **COMPLETED**
- Enforce `TokenAuthentication` + `IsAuthenticatedOrReadOnly` on records.
- Tests: anonymous GET ok; anonymous POST → 401/403; authenticated POST (with token) → 201.

---

## Out of scope / handled elsewhere

- No model changes → no migrations.
- No commits, no git manipulation, no deployment changes (Railway config untouched).
- Existing website HTML CRM untouched — API is additive only.