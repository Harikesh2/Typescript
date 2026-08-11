# FEATURES — Feature registry

Reference file tracking the DRF JSON API on top of the Django CRM. Implemented features are recorded here so future work has a track record. `PLAN.md` holds the current working plan; this file is the permanent record of what exists.

Docs: [README.md](README.md) · [PLAN.md](PLAN.md)

> How to add a feature: add a row below with status 📋 → mark 🚧 when you start → implement it → add detail under **Implemented features** → flip to ✅.

## Feature registry

Status: ✅ Implemented · 🚧 In progress · 📋 Planned

| # | Feature | Endpoint / scope | Status | Phase | Date | Notes |
|---|---------|------------------|--------|-------|------|-------|
| 1 | Test scaffold | pytest + pytest-django, SQLite test DB, root `tests/`, CI workflow | ✅ | 0 | 2026-08-08 | `python -m pytest` gate |
| 2 | DRF bootstrap | `/api/` root, `api` app, TokenAuth + `IsAuthenticatedOrReadOnly` defaults | ✅ | 1 | 2026-08-10 | No features yet, wiring only |
| 3 | List records | `GET /api/records/` | ✅ | 2 | 2026-08-10 | Plain JSON array, no pagination |
| 4 | Create record | `POST /api/records/` | ✅ | 3 | 2026-08-10 | 201 / 400; authenticated required |
| 5 | Record detail | `GET /api/records/<pk>/` | ✅ | 4 | 2026-08-10 | 200 / 404 (missing + invalid pk) |
| 6 | Update record | `PUT/PATCH /api/records/<pk>/` | ✅ | 5 | 2026-08-10 | Full replace / partial update |
| 7 | Delete record | `DELETE /api/records/<pk>/` | ✅ | 6 | 2026-08-10 | 204; anonymous → 403 |
| 8 | Register | `POST /api/auth/register/` | ✅ | 7 | 2026-08-10 | Creates User + token; AllowAny |
| 9 | Obtain token | `POST /api/auth/token/` | ✅ | 8 | 2026-08-10 | 200 + token / 400 bad creds |
| 10 | Permission locking | All record writes + real-token header tests | ✅ | 9 | 2026-08-10 | Anonymous POST/DELETE → 403 |

## Implemented features (detailed)

### Infrastructure

- **Test scaffold** — pytest + pytest-django configured in `pytest.ini` (`DJANGO_SETTINGS_MODULE=dcrm.settings`); tests run on in-memory SQLite via root `conftest.py` (`USE_SQLITE=1`), never MySQL. Shared fixtures (`test_user`, `auth_client`) in `tests/conftest.py`. CI runs `python -m pytest` on every push and PR to `main` (`.github/workflows/ci.yml`).
- **DRF bootstrap** — `djangorestframework` added; `rest_framework`, `rest_framework.authtoken`, `api` registered in `INSTALLED_APPS`; global `REST_FRAMEWORK` defaults: `TokenAuthentication` + `IsAuthenticatedOrReadOnly`. API mounted at `/api/`.

### Auth API

- **`POST /api/auth/register/`** — `RegisterAPIView` (`AllowAny`). `RegisterSerializer` validates `username` (unique), optional `email`, `password` (min 8, write-only); `create()` builds the user (hashed password) + auth `Token`. Returns `201` `{id, username, email, token}`. Duplicate username → 400; bad email → 400.
- **`POST /api/auth/token/`** — DRF's built-in `obtain_auth_token`. Correct username/password → `200 {token: ...}`; wrong credentials → `400 non_field_errors`.

### Records API

Model `website.models.Record` — **no model or migration changes**; API is additive only. Writes are authenticated (global `IsAuthenticatedOrReadOnly`; anonymous writes denied). Read access is public.

| Method | Endpoint | Behavior | Errors |
|--------|----------|----------|--------|
| GET | `/api/records/` | `ListCreateRecordAPIView` → plain JSON array | — |
| POST | `/api/records/` | `201` created record | `400` missing/invalid fields; `403` anonymous |
| GET | `/api/records/<pk>/` | `RetrieveUpdateDestroyRecordAPIView` → `200` full object | `404` missing / invalid pk |
| PUT | `/api/records/<pk>/` | `200` full replace (all fields required) | `400` missing required fields; `403` anonymous |
| PATCH | `/api/records/<pk>/` | `200` partial update | `400` invalid; `403` anonymous |
| DELETE | `/api/records/<pk>/` | `204` object removed | `404` missing pk; `403` anonymous |

`RecordSerializer` exposes all model fields with `created_at` read-only. Pseudo-requirement notes kept from the phase log: DRF's `ModelSerializer` ignores unknown keys rather than rejecting them; login/automated permissions verified over real `HTTP_AUTHORIZATION: Token <key>` headers in tests.

## Planned / next features

- [ ] <Next feature>
- [ ] <Another feature>

## How to add a feature

1. Add a row to **Feature registry** with status 📋 (or tick a **Planned** item).
2. Set status 🚧 before implementing.
3. Follow the plan in `PLAN.md` one phase at a time.
4. Implement + verify the phase gate (`python -m pytest`).
5. Add detail under **Implemented features** and flip the registry row to ✅.