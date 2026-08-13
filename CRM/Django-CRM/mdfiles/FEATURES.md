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
| 11 | Search & filters | `GET /api/records/?search=&ordering=&state=` | ✅ | 0 | 2026-08-11 | Search name/email; state exact (ci); sort |
| 12 | Opt-in pagination | `GET /api/records/?page=` | ✅ | 0 | 2026-08-11 | `{count,next,previous,results}`; array without `?page=` |
| 13 | Stats | `GET /api/stats/` | ✅ | 0 | 2026-08-11 | Token-gated aggregates for dashboard |
| 14 | Current user | `GET /api/auth/me/` | ✅ | 0 | 2026-08-11 | `{id, username, email}` for navbar chip |
| 15 | Frontend scaffold | Primer shell: sidebar + topbar, `/login`, `/dashboard` | ✅ | 1 | 2026-08-11 | Primer design (D-10); mock data; UI-only login |
| 16 | Records stub routes | `/records`, `/records/new` | ✅ | 1 | 2026-08-11 | Placeholders; CRUD UI in Phase 4 |
| 17 | Reports API | `GET /api/reports/` | 🚧 | — | 2026-08-13 | Token-gated aggregates; monthly + state breakdown |
| 18 | Reports page | `/reports` | 🚧 | — | 2026-08-13 | Stat cards + DataTable views; sidebar link |

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
| GET | `/api/records/` | `ListCreateRecordAPIView` → plain JSON array; filters `?search=`, `?state=`, `?ordering=` | `404` invalid `?page=` |
| POST | `/api/records/` | `201` created record | `400` missing/invalid fields; `403` anonymous |
| GET | `/api/records/<pk>/` | `RetrieveUpdateDestroyRecordAPIView` → `200` full object | `404` missing / invalid pk |
| PUT | `/api/records/<pk>/` | `200` full replace (all fields required) | `400` missing required fields; `403` anonymous |
| PATCH | `/api/records/<pk>/` | `200` partial update | `400` invalid; `403` anonymous |
| DELETE | `/api/records/<pk>/` | `204` object removed | `404` missing pk; `403` anonymous |

`RecordSerializer` exposes all model fields with `created_at` read-only. Pseudo-requirement notes kept from the phase log: DRF's `ModelSerializer` ignores unknown keys rather than rejecting them; login/automated permissions verified over real `HTTP_AUTHORIZATION: Token <key>` headers in tests.

### Dashboard API (Phase 0)

- **Search & filters** — `GET /api/records/?search=<term>` (icontains on `first_name`/`last_name`/`email`), `?ordering=<field|->field>` (all fields, default model order), `?state=<XX>` exact case-insensitive. Response stays a plain JSON array.
- **Opt-in pagination** — `GET /api/records/?page=1` returns `{count, next, previous, results}` (`page_size=20`, overridable with `?page_size=`); without `?page=` the response is the legacy plain array (D-07).
- **`GET /api/stats/`** — `StatsAPIView`, token required (D-06). Returns `total_records`, `records_this_week` (UTC Monday-based), `records_this_month` (UTC calendar month), `distinct_states`, `by_state` (`[{state, count}]` desc), `newest_record` (full object or `null`).
- **`GET /api/auth/me/`** — `MeAPIView`, token required. Returns `{id, username, email}` for the authenticated user's navbar chip.

### Frontend scaffold (Phase 1)

- **Primer design system** — `@primer/react` + `@primer/primitives` tokens + `styled-components` SSR registry in `frontend/src/app/layout.tsx` → `components/providers.tsx` → `styled-components-registry.tsx` (dark/night mode). Replaces the original Tailwind v4 pastel plan (D-04 → D-10).
- **Shell** — sidebar (Dashboard `/dashboard`, Records `/records`, Add Record `/records/new`, Logout placeholder → `/login`) + topbar with user chip; shared `TopBar`/`AppSidebar` components.
- **Routes** — `/` redirects to `/login` (UI-only placeholder, real auth is Phase 2); `/dashboard` renders mock `StatCards` + `ContactsTable` (data from `lib/contacts.ts`, real API in Phase 3); `/records` + `/records/new` are stubs via `components/crm/stub-page.tsx` (CRUD UI in Phase 4).
- **Config** — `next.config.ts` sets `env.DJANGO_API_URL` (default `http://localhost:8000`, consumed from Phase 2).

### Reports (additional feature)

- **`GET /api/reports/`** — `ReportAPIView`, token required. Returns `total_records`, `records_per_month` (`[{month, count}]` — `created_at` grouped by month, ascending, `month` may be `null`), `by_state` (`[{state, count}]` desc). Optional `?from=`/`?to=` ISO datetime range filters; invalid values → 400.
- **`/reports` page** — client page in the app shell: summary stat cards (total records, months with records, distinct states) + two `DataTable` views (records per month, records by state), driven by the BFF proxy fetch to `/api/reports/`.

## Planned / next features

- [ ] <Next feature>
- [ ] <Another feature>

## How to add a feature

1. Add a row to **Feature registry** with status 📋 (or tick a **Planned** item).
2. Set status 🚧 before implementing.
3. Follow the plan in `PLAN.md` one phase at a time.
4. Implement + verify the phase gate (`python -m pytest`).
5. Add detail under **Implemented features** and flip the registry row to ✅.