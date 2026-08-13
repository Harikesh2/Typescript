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
| 17 | Reports API | `GET /api/reports/` | ✅ | — | 2026-08-13 | Token-gated aggregates; monthly + state breakdown |
| 18 | Reports page | `/reports` | ✅ | — | 2026-08-13 | Stat cards + DataTable views; sidebar link |
| 19 | BFF auth handlers | `/api/auth/login`, `/register`, `/logout` + catch-all `/api/[...path]` proxy | ✅ | 2 | 2026-08-13 | Token in httpOnly cookie; register auto-login; proxy injects `Authorization` |
| 20 | Cookie session | `dcrm_token` httpOnly, secure in prod, sameSite=lax | ✅ | 2 | 2026-08-13 | Never exposed to browser JS (D-02) |
| 21 | Route protection | `proxy.ts` `proxy` export | ✅ | 2 | 2026-08-13 | Unauthenticated → `/login?next=`; authenticated on auth pages → `/dashboard` |
| 22 | Dashboard KPI cards | `/dashboard` via `/api/stats/` | ✅ | 3 | 2026-08-13 | Total / This week / This month / Top state cards with live data |
| 23 | Recent records preview | `/dashboard` via `/api/records/?ordering=-created_at` | ✅ | 3 | 2026-08-13 | 5 latest records; Name/Email/City/State/Created |
| 24 | Records list UI | `/records` via `/api/records/` | ✅ | 4 | 2026-08-13 | Search/state filter/server sort + pagination + edit/delete |
| 25 | Record create form | `/records/new` → `POST /api/records/` | ✅ | 4 | 2026-08-13 | Shared form; field-keyed errors; redirect to detail |
| 26 | Record detail | `/records/[id]` via `GET /api/records/<pk>/` | ✅ | 4 | 2026-08-13 | All fields; edit + confirmed delete; 404 state |
| 27 | Record edit form | `/records/[id]/edit` → `PATCH /api/records/<pk>/` | ✅ | 4 | 2026-08-13 | Prefilled shared form; redirect to detail |
| 28 | Frontend container | `frontend/Dockerfile` + compose `frontend` service | ✅ | 5 | 2026-08-13 | Multi-stage `node:22-alpine`; `output: 'standalone'`; non-root |
| 29 | Runtime `DJANGO_API_URL` | BFF proxy reads `process.env` at runtime | ✅ | 5 | 2026-08-13 | D-22; overridable without rebuild (e.g. compose `http://web:8000`) |
| 30 | DEBUG env toggle | `dcrm/settings.py` | ✅ | 5 | 2026-08-13 | `os.environ.get('DEBUG', 'True')`; `.env.example` template |
| 31 | CI frontend job | `.github/workflows/ci.yml` | ✅ | 5 | 2026-08-13 | `npm ci` + `npm run lint` + `npm run build`; `CRM/frontend/**` paths |
| 32 | Legacy UI deprecated | `website/templates/base.html` | ✅ | 5 | 2026-08-13 | Deprecation banner comment (D-03) |
| 33 | PostgreSQL runtime DB | `dcrm/settings.py`, compose `postgres:16` | ✅ | — | 2026-08-13 | D-24; `psycopg2-binary`; SQLite stays for tests only |
| 34 | DB schema healthcheck | `python manage.py healthcheck` + `website/checks.py` + compose gate | ✅ | — | 2026-08-13 | D-25; detect-and-fail; Warning-level system check; skipped on SQLite |

## Implemented features (detailed)

### Infrastructure

- **Test scaffold** — pytest + pytest-django configured in `pytest.ini` (`DJANGO_SETTINGS_MODULE=dcrm.settings`); tests run on in-memory SQLite via root `conftest.py` (`USE_SQLITE=1`), never MySQL. Shared fixtures (`test_user`, `auth_client`) in `tests/conftest.py`. CI runs `python -m pytest` on every push and PR to `main` (`.github/workflows/ci.yml`).
- **DRF bootstrap** — `djangorestframework` added; `rest_framework`, `rest_framework.authtoken`, `api` registered in `INSTALLED_APPS`; global `REST_FRAMEWORK` defaults: `TokenAuthentication` + `IsAuthenticatedOrReadOnly`. API mounted at `/api/`.
- **PostgreSQL runtime DB (D-24)** — `dcrm/settings.py` uses `django.db.backends.postgresql` (env-driven `DB_NAME`/`DB_USER`/`DB_PASSWORD`/`DB_HOST`, `DB_PORT` default `5432`); driver `psycopg2-binary`; compose `db` service is `postgres:16` with `POSTGRES_DB/USER/PASSWORD`, port `5432`, `pg_isready` healthcheck, and `postgres_data` volume; Dockerfile builds against `libpq-dev`. SQLite remains the in-memory pytest DB only (`USE_SQLITE=1`).
- **DB schema healthcheck (D-25)** — `python manage.py healthcheck` verifies the DB on startup: connectivity, all migrations applied (`MigrationExecutor` plan), and every model table present (`connection.introspection.table_names()` vs each `_meta.db_table`, deduped). Exits `0`/`1`. `website/checks.py` also registers an untagged system check (Warning level so a fresh DB can still run `migrate`), surfaced by `runserver`/`manage.py check` and skipped under `USE_SQLITE=1`; on Django 6.1 it's imported via `website/apps.py` `ready()` (app `checks.py` no longer auto-loads) and untagged because `runserver` skips `Tags.database` checks. Compose `web` runs `migrate && healthcheck && gunicorn`, exposes a `healthcheck` probe, and `frontend` only starts after `web` is healthy.

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

### Frontend auth (Phase 2)

- **BFF proxy + cookie session** — browser never holds the DRF token (D-02). Route handlers under `/api/auth/` exchange credentials for a token and store it in the `dcrm_token` httpOnly cookie (secure in prod, sameSite=lax, 30-day maxAge). `/api/auth/register` auto-logs-in (D-16); `/api/auth/logout` clears the cookie (D-15). The catch-all `/api/[...path]` route proxies every other `/api/*` call to Django, injecting `Authorization: Token <cookie>` (D-17).
- **Route protection** — `src/proxy.ts` exports `proxy` (Next 16.3, D-14/D-18): unauthenticated users on `/dashboard`, `/records`, `/reports` → `/login?next=<path>`; authenticated users on `/login`/`/register` → `/dashboard`. Login honors `?next=` against an in-app allowlist (no open redirect). Status: ✅ COMPLETED (2026-08-13, `npm run build` passes).

### Dashboard (Phase 3)

- **KPI cards** — `StatCards` fetches `/api/stats/` through the BFF proxy and renders four live cards: Total records (`total_records`, PeopleIcon), This week (`records_this_week`, PulseIcon), This month (`records_this_month`, CheckCircleIcon), Top state (`by_state[0].state`, GraphIcon). Loading/empty states shown before data arrives. Status: ✅ COMPLETED (2026-08-13).
- **Recent records preview** — `RecentRecords` fetches `/api/records/?ordering=-created_at` (plain-array response, D-07), slices to the 5 latest, and renders a Primer `DataTable` (Name, Email, City, State, Created). Mock `ContactsTable` no longer used on `/dashboard` but kept in place for now. Status: ✅ COMPLETED (2026-08-13).

### Records CRUD UI (Phase 4)

- **List** — `RecordsList` on `/records`: search `TextInput` (`?search=`, debounced), state `Select` from `/api/stats/` `by_state` (D-20), "Add record" button; Primer `DataTable` with server-side sort (`externalSorting` + `onToggleSort` → `?ordering=`, D-19) and Primer `Pagination` → `?page=` (D-07 `{count,next,previous,results}`, page_size 20); per-row edit/delete via `useConfirm`; `Blankslate` empty state. Status: ✅ COMPLETED (2026-08-13).
- **Create/Edit form** — shared `RecordForm`: all 8 fields required with client trim/validation, backend field-keyed errors on `FormControl.Validation`, `non_field_errors` banner. Create (`POST /api/records/`) redirects to `/records/<id>`; Edit (`PATCH /api/records/<pk>/`) prefills from `/api/records/<pk>/` and redirects to the detail page. Status: ✅ COMPLETED (2026-08-13).
- **Detail** — `RecordDetail` on `/records/[id]`: all fields in a 3-col grid, Edit + danger Delete (`useConfirm` → `DELETE` → back to `/records`), 404 `Blankslate`, load-failure `Flash`. Status: ✅ COMPLETED (2026-08-13).
- **Shared types** — `src/lib/types.ts` (`Record`, `RecordsPage`, `RecordPayload`, `StatsData`) reused by dashboard + records components.

### Polish, deploy, deprecate (Phase 5)

- **Frontend container (D-23)** — `frontend/next.config.ts` sets `output: 'standalone'`; new multi-stage `frontend/Dockerfile` (node:22-alpine: `npm ci` → `npm run build` → runtime stage copying `.next/standalone` + `.next/static` + `public`, `node server.js` as non-root `nextjs` user) + `frontend/.dockerignore`. Compose gains a `frontend` service (`DJANGO_API_URL=http://web:8000`, port 3000), so `docker-compose up --build` boots db + web + frontend together.
- **Runtime `DJANGO_API_URL` (D-22)** — build-time `env` bake removed from `next.config.ts`; the BFF proxy reads `process.env.DJANGO_API_URL` at runtime (fallback `http://localhost:8000`), so containers/deploy environments override the backend URL without a rebuild.
- **DEBUG env toggle** — `Django-CRM/dcrm/settings.py` reads `DEBUG` from the environment (`True` default in dev); `Django-CRM/.env.example` ships the `SECRET_KEY`/`DEBUG`/`DB_*` template.
- **CI frontend job** — `.github/workflows/ci.yml` now triggers on `CRM/frontend/**` and adds a `frontend` job (`setup-node 22` + npm cache, `npm ci`, `npm run lint`, `npm run build`).
- **Legacy UI deprecated (D-03)** — `website/templates/base.html` carries an HTML comment marking the Bootstrap templates deprecated in favor of `/frontend`.

## Planned / next features

- [ ] <Next feature>
- [ ] <Another feature>

## How to add a feature

1. Add a row to **Feature registry** with status 📋 (or tick a **Planned** item).
2. Set status 🚧 before implementing.
3. Follow the plan in `PLAN.md` one phase at a time.
4. Implement + verify the phase gate (`python -m pytest`).
5. Add detail under **Implemented features** and flip the registry row to ✅.