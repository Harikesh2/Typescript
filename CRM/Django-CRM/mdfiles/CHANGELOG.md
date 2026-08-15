# CHANGELOG — Django CRM Next.js Frontend

> Single changelog for all phase changes. Created once; append per phase. Follows `PLAN.md` (one phase at a time).

## PR review `new_ui` — closed out (2026-08-15)

**Status:** COMPLETE

- All 20 review items resolved (18 fixed, 2 skipped by decision: M3 → D-33 opt-in pagination, L3 → cookie already hardened).
- Backend gate `python -m pytest` → **52 passed** (M1/M2/M4/M5/M6 + M4 `.distinct()` revert).
- Frontend `npm run build` + `npm run lint` (M7/M8) — pending user.
- `mdfiles/PR_REVIEW.md` removed — decisions already preserved in `DECISIONS.md` (D-25→D-33) and this changelog.

## PR_REVIEW fixes — M-batch + H2 verify (2026-08-15)

**Status:** IN PROGRESS · **Gate:** `python -m pytest` green (M1/M2/M4/M5/M6); `npm run build` + `npm run lint` pass (M7/M8)

### Files touched

- `Django-CRM/api/views.py` (M1 — 5 overrides removed; M4 — `.distinct()`; M5 — tie-break; M6 — `by_state()` helper)
- `Django-CRM/api/serializers.py` (M2 — dict return + read-only `id`/`token`)
- `Django-CRM/tests/test_records.py` (M1 — 403 → 401 ×2)
- `Django-CRM/tests/test_stats.py` (M1 — 403 → 401)
- `Django-CRM/tests/test_auth.py` (M1 — 403 → 401)
- `Django-CRM/tests/test_reports.py` (M1 — 403 → 401)
- `frontend/src/app/globals.css` (M7 — `.crm-card`)
- `frontend/src/components/crm/record-detail.tsx` (M7)
- `frontend/src/components/crm/recent-records.tsx` (M7)
- `frontend/src/components/crm/edit-record.tsx` (M7)
- `frontend/src/components/crm/reports.tsx` (M7)
- `frontend/src/components/crm/contacts-table.tsx` (M8 — deleted)
- `frontend/src/components/crm/stub-page.tsx` (M8 — deleted)
- `frontend/src/lib/contacts.ts` (M8 — deleted)
- `frontend/public/placeholder.svg` (M8 — deleted, orphaned)
- `mdfiles/DECISIONS.md` (D-31, D-32, D-33)
- `mdfiles/CHANGELOG.md`
- `mdfiles/PR_REVIEW.md` (status updates)
- `mdfiles/FEATURES.md` (403 → 401 rows)
- `mdfiles/PLAN.md` (Phase 6)

### Changes made

- **M1 — five copy-pasted `permission_denied` overrides deleted** — `ListCreateRecordAPIView`, `RetrieveUpdateDestroyRecordAPIView`, `StatsAPIView`, `ReportAPIView`, `MeAPIView` no longer override `permission_denied`. DRF now returns **401 NotAuthenticated** for anonymous requests and 403 for authenticated-but-forbidden (correct semantics). Tests updated `403 → 401` in `test_records.py:107,254`, `test_stats.py:15`, `test_auth.py:88`, `test_reports.py:15` (D-31).
- **M2 — register serializer returns a dict** — `RegisterSerializer.create()` now returns `{id, username, email, token}` instead of the `(user, token)` tuple; `to_representation` deleted. `id`/`token` are declared read-only serializer fields so DRF's default `to_representation` keeps them in the response (the BFF register route reads `data.token`). Response shape unchanged (D-32).
- **M4 — `.distinct()` retained** — the review claimed it was a no-op on `values()`, but `values('state').count()` actually counts all record rows (one per record), not distinct states. `.distinct()` is needed to count truly distinct states. Earlier notes in this changelog and PR_REVIEW.md incorrectly said it was deleted/no-op; the code retains `.distinct()` on the `distinct_states` line.
- **M5 — `by_state` tie-break** — both aggregate blocks now `order_by('-count', 'state')` so equal-count states sort deterministically.
- **M6 — shared `by_state()` helper** — extracted `by_state(queryset)` in `api/views.py` (values + `Count('id')` + `-count, state`); `StatsAPIView` passes `Record.objects.all()`, `ReportAPIView` its range-filtered queryset.
- **M7 — `.crm-card` class** — added `padding: var(--base-size-24)` + border + radius + bg to `globals.css`; replaced matching inline card styles in `edit-record.tsx` (×3), `record-detail.tsx` (×2), `recent-records.tsx` (×1), `reports.tsx` loading card (×1). Stat cards (`stat-cards.tsx`, `reports.tsx` ×3) left inline — they differ (boxShadow + Stack padding); `auth-shell.tsx`/`record-form.tsx` have no card border.
- **M8 — dead code removed** — `contacts-table.tsx`, `stub-page.tsx`, `lib/contacts.ts` deleted (nothing imported them; grep-verified). `public/placeholder.svg`, only referenced by the deleted `contacts-table`, also removed.
- **H2 — confirmed already resolved** — `.github/workflows/ci.yml` exists at the git root and is committed in `new_ui` (backend pytest on SQLite via `conftest.py`; frontend lint + build on `CRM/frontend/**`). No code change; only the PR_REVIEW.md status updated.

### Verification

- `python -m pytest` (M1/M2/M4/M5/M6) — ⏳ pending (user runs gate).
- `npm run build` (M7/M8) — ⏳ pending (user runs gate).
- `npm run lint` (M7/M8) — ⏳ pending (user runs gate).
- visual regression: `/records`, `/records/[id]`, `/records/[id]/edit`, `/dashboard`, `/reports` still render identical cards — ⏳ pending (user).

## PR_REVIEW fixes — HIGH (H1, H4, H5, H6) (2026-08-14)

**Status:** IN PROGRESS · **Gate:** `npm run build` + `npm run lint` pass; create/update/delete records through the new-record/edit forms against a running Django API; prod container without `DJANGO_API_URL` fails fast; `DROP TABLE website_record` → `manage.py check` exits non-zero; fresh-DB `migrate` still works; `docker compose up -d --build` → `web` healthy with migrate → healthcheck → gunicorn in order

### Files touched

- `frontend/src/app/api/[...path]/route.ts` (H1)
- `frontend/src/components/crm/records-list.tsx` (records pagination shape)
- `frontend/src/lib/auth.ts` (H4)
- `README.md` (Configuration Reference + Getting Started — `DJANGO_API_URL` now required in prod; Docker Deployment — entrypoint preflight)
- `Django-CRM/website/checks.py` (H5 — selective severity)
- `Django-CRM/website/management/commands/healthcheck.py` (H5 — unpack severity)
- `Django-CRM/Dockerfile` (H6 — ENTRYPOINT + plain gunicorn CMD)
- `Django-CRM/entrypoint.sh` (H6 — new)
- `Django-CRM/docker-compose.yml` (H6 — `web` command simplified, healthcheck slimmed)
- `mdfiles/DECISIONS.md` (D-26, D-27, D-28, D-29, D-30, D-25 update; D-17 superseded)
- `mdfiles/CHANGELOG.md`

### Changes made

- **H1 — BFF proxy drops request body on POST/PUT/PATCH/DELETE** — `request.body` is a `ReadableStream`; passing it straight into `fetch` after the request was inspected silently dropped it for non-GET/HEAD. The catch-all proxy now buffers the body once (`await request.arrayBuffer()`) for non-GET/HEAD, forwards it as `body`, and sets `redirect: 'manual'` so Next never swallows upstream 3xx. No `duplex` needed (ArrayBuffer is a valid `BodyInit`; D-17 superseded by D-27). Writes from `/records/new`, `/records/[id]/edit`, login, and register now reach Django with their payloads.
- **H1-followup — infinite 301 redirect loop on every `/api/*` call** — surfaced once `redirect: 'manual'` exposed what the old follow-redirect behavior masked. Next's default `trailingSlash` handling 308s `/api/records/` → `/api/records` before the handler runs, so the proxy forwarded a no-slash path to Django, whose `APPEND_SLASH` 301'd back to `/api/records/`; the browser followed → 308 → 301 → loop, UI empty. The proxy now appends a trailing slash to the forwarded path when missing (`route.ts`), so Django never 301s (D-29); this also restores write correctness that D-21 aimed for but couldn't reach because `nextUrl.pathname` never received the slash. The running build predated this fix, so the loop persisted until the dev server was restarted / rebuilt.
- **H1-followup — `/records` blank page from pagination shape mismatch** — backend pagination is opt-in (D-07); `buildUrl` only added `?page=` when `page > 1`, so page 1 returned a plain array and `data?.results.map(...)` threw a TypeError on the undefined `results`, blanking the page. The records list now always sends `?page=` (including `page=1`) so the response is always `{count, next, previous, results}`, and the render guards with `data?.results?.map(...) ?? []` so the loading/null state can't crash. Backend behavior unchanged, so D-07's plain-array tests stay green (D-30).
- **H1-followup — `Expected either an `id` or `field` to be defined for a Column`** — surfaced once data rendered after the shape fix. Primer's `useTable` throws for any column lacking both `id` and `field`; the records list Actions column had only `header` + `renderCell`. Added `id: 'actions'` (matching `contacts-table.tsx`), clearing the DataTable render crash.
- **H4 — `DJANGO_API_URL` silent localhost fallback in prod** — `getDjangoApiUrl()` now throws `DJANGO_API_URL is required in production` when the variable is unset and `NODE_ENV=production`; dev keeps the `http://localhost:8000` fallback. Only server-side modules import `auth.ts` (route handlers, `proxy.ts`), so `next build` is unaffected. README's Configuration Reference documents the prod requirement (D-26).
- **H5 — healthcheck severity raised selectively** — `verify_schema()` now returns `(severity, message)` tuples. `db_schema_check` maps them: **unapplied migrations → Warning** (transient first-run state; Error would deadlock fresh-DB `migrate` since Django runs system checks before applying migrations), **missing tables with no unapplied migrations → Error** (true corruption), **could not verify schema → Error**. `manage.py healthcheck` unchanged in behavior (still exits 1 on any problem), now unpacking the severity. D-25 updated to note the level change.
- **H6 — compose command/healthcheck race** — the `web` preflight moved out of the compose `command` chain (`sh -c "migrate && healthcheck && gunicorn"`) into a dedicated `Dockerfile` `ENTRYPOINT` (`/entrypoint.sh`: `migrate --noinput` → `healthcheck` → `exec "$@"`); compose `command` is now plain gunicorn and the `web` healthcheck is slimmed (`interval 10s`, `retries 6`, no `start_period`). The old chain raced the container healthcheck (which ran `manage.py healthcheck` in parallel and could pass before gunicorn bound); the entrypoint decouples the one-time preflight from the long-running server (D-28). README's Docker section updated.

### Verification

- `npm run build` — ⏳ pending (user runs gate).
- `npm run lint` — ⏳ pending (user runs gate).
- e2e: `POST /api/records/` from the new-record form → Django receives the JSON body — ⏳ pending (user).
- 301-loop: `/records` list populates and create/edit/delete work with no 301s in the Next dev log — ⏳ pending (user).
- prod runtime without `DJANGO_API_URL` → proxied request fails with the clear error in logs — ⏳ pending (user).
- `next build` in CI (no `DJANGO_API_URL` set) still passes — ⏳ pending (user).
- H5: `DROP TABLE website_record;` → `python manage.py check` exits non-zero, `python manage.py healthcheck` exits 1 — ⏳ pending (user).
- H5: fresh-DB `python manage.py migrate` still succeeds (unapplied migrations stay Warning) — ⏳ pending (user).
- H5: `python -m pytest` (USE_SQLITE=1 skips the check) — ⏳ pending (user).
- H6: `docker compose up -d --build` → `web` healthy; logs show migrate → healthcheck → gunicorn in order — ⏳ pending (user).

## DB schema healthcheck (D-25) (2026-08-13)

**Status:** IN PROGRESS · **Gate:** `python manage.py healthcheck` exit 0 on healthy Postgres / exit 1 with a dropped table; `python -m pytest` green; `docker-compose up --build` boots with `web` healthy before `frontend`

### Files touched

- `Django-CRM/website/management/__init__.py` (new)
- `Django-CRM/website/management/commands/__init__.py` (new)
- `Django-CRM/website/management/commands/healthcheck.py` (new)
- `Django-CRM/website/checks.py` (new)
- `Django-CRM/website/apps.py` (`ready()` imports `website.checks`)
- `Django-CRM/docker-compose.yml` (`web` command chain + healthcheck; `frontend` depends_on healthy)
- `mdfiles/DECISIONS.md` (D-25)
- `mdfiles/CHANGELOG.md`
- `mdfiles/FEATURES.md` (feature 34)

### Changes made

- **`python manage.py healthcheck`** — management command (D-25): connects to the DB, checks all migrations are applied (`MigrationExecutor` plan over the graph leaf nodes), and introspects `connection.introspection.table_names()` against every model `_meta.db_table` in `INSTALLED_APPS` (deduped — proxy models share a table). Prints a report and exits `0`/`1`. Shared logic lives in `website/checks.py` (`verify_schema()`).
- **System check** — `website/checks.py` registers `db_schema_check`, so `runserver`/`manage.py check` surface schema problems at startup. **Warning level (D-25 rationale)**: Django runs system checks *before* applying migrations, so Critical would block `migrate` on a fresh DB (chicken-and-egg). The hard fail-fast gate is the command exit code + compose healthcheck. Skipped entirely when `USE_SQLITE=1` (pytest stays green). **Django 6.1 wiring** — app `checks.py` modules are no longer auto-imported by `Apps.populate()` (removed `import_checks()`), so `website/apps.py` `ready()` explicitly imports `website.checks`; and the check is registered untagged (`@checks.register`, not `Tags.database`) because `run_checks()` skips database-tagged checks under `runserver` (no DB alias passed).
- **Compose gate** — `web` command chain is now `python manage.py migrate && python manage.py healthcheck && gunicorn …` (migrate creates, healthcheck verifies, server refuses to start on failure); `web` gets a `healthcheck: python manage.py healthcheck` probe; `frontend` `depends_on: web: condition: service_healthy` so the UI only starts once the schema is verified.

### Verification

- `USE_SQLITE=1 python3 manage.py healthcheck` (empty DB) — ✅ correctly fails: unapplied migrations + missing tables listed, exit 1.
- `USE_SQLITE=1 python3 manage.py healthcheck` (after `migrate`, same process) — ✅ `OK: migrations applied and all model tables exist`, exit 0.
- System check registration — ✅ `db_schema_check` registered via `apps.py` `ready()`; fires 2 Warnings on a broken schema, 0 issues under `USE_SQLITE=1` (sandbox-verified).
- `python -m pytest` — ⏳ pending (user runs gate).
- `python manage.py healthcheck` vs Postgres (healthy / dropped table) — ⏳ pending (user runs gate).
- `docker-compose up --build` — ⏳ pending (user runs gate).


## PostgreSQL runtime DB (2026-08-13)

**Status:** COMPLETED · **Gate:** `python -m pytest` green; `python manage.py migrate` + `runserver` against Postgres; `docker-compose up --build` boots db + web + frontend

### Files touched

- `Django-CRM/.env` (MySQL → PostgreSQL values; `DB_HOST=localhost`, `DB_PORT=5432`)
- `Django-CRM/.env.example` (same keys, `DB_PORT=5432`)
- `Django-CRM/dcrm/settings.py` (`ENGINE` → `django.db.backends.postgresql`; `DB_PORT` default `5432`; `load_dotenv(BASE_DIR / '.env')` + `python-dotenv` so local `runserver` reads `.env`)
- `Django-CRM/requirements.txt` (`mysqlclient` → `psycopg[binary]`; added `python-dotenv`)
- `Django-CRM/Dockerfile` (`default-libmysqlclient-dev` → `libpq-dev`)
- `Django-CRM/docker-compose.yml` (`mysql:8.0` → `postgres:16`; `POSTGRES_*` env; port `5432`; `pg_isready` healthcheck; volume `postgres_data`)
- `README.md` (Docker + config table → PostgreSQL / 5432)
- `mdfiles/DECISIONS.md` (D-24)
- `mdfiles/CHANGELOG.md`
- `mdfiles/FEATURES.md` (feature 33)

### Changes made

- **PostgreSQL runtime (D-24)** — `settings.py` now uses `django.db.backends.postgresql` (default `DB_PORT=5432`); driver swapped `mysqlclient` → `psycopg[binary]` (psycopg v3 — Django 4.2+ imports `psycopg` natively and `psycopg-binary` ships Python 3.14 wheels, unlike `psycopg2-binary`); Dockerfile builds against `libpq-dev`; compose `db` service is `postgres:16` (`POSTGRES_DB/USER/PASSWORD`, port `5432:5432`, `pg_isready` healthcheck, `postgres_data` volume). `.env`/`.env.example` carry placeholder values (`localhost:5432`, `elderco`, `crmuser`) — replace with the real endpoint.
- **Local `.env` loading** — added `python-dotenv` + `load_dotenv(BASE_DIR / '.env')` at the top of `settings.py`; Django does not read `.env` itself, so local `runserver` now picks up `DB_*` (docker-compose/deploy still inject env directly).
- **SQLite unchanged for tests** — `USE_SQLITE=1`, `dcrm/settings_test.py`, and `conftest.py` untouched; pytest continues on in-memory SQLite.

### Verification

- `python -m pytest` — ✅ passes (2026-08-13).
- `python manage.py migrate` + `runserver` vs Postgres — ✅ passes (2026-08-13, user-verified on Windows/Python 3.14).
- `docker-compose up --build` — ✅ boots db + web + frontend (2026-08-13, user-verified).


## Phase 5 — Polish, deploy, deprecate (2026-08-13)

**Status:** COMPLETED · **Gate:** `python -m pytest` green; `npm run build` + `npm run lint` pass; `docker-compose up --build` boots db + web + frontend

### Files touched (chunk A)

- `frontend/next.config.ts` (removed build-time `env` bake; `output: 'standalone'` — D-22)
- `frontend/Dockerfile` (new)
- `frontend/.dockerignore` (new)
- `Django-CRM/docker-compose.yml` (added `frontend` service)
- `Django-CRM/dcrm/settings.py` (`DEBUG` now env-driven)
- `Django-CRM/.env.example` (new)
- `Django-CRM/website/templates/base.html` (deprecation banner comment, D-03)
- `.github/workflows/ci.yml` (frontend job + `CRM/frontend/**` paths)
- `mdfiles/DECISIONS.md` (D-22, D-23)
- `mdfiles/PLAN.md` (Phase 5 → IN PROGRESS)
- `mdfiles/CHANGELOG.md`
- `PHASE5_HANDOFF.md` (new — session handoff, delete after Phase 5 closes)

### Changes made (chunk A)

- **Runtime `DJANGO_API_URL` (D-22)** — dropped the `env: { DJANGO_API_URL }` block from `next.config.ts`; the BFF route handlers already read `process.env.DJANGO_API_URL` at runtime (`src/lib/auth.ts` fallback to `http://localhost:8000`). Containers/deploy environments can now override the backend URL without a rebuild.
- **Standalone output + Dockerfile (D-23)** — `next.config.ts` sets `output: 'standalone'`; new multi-stage `frontend/Dockerfile` (node:22-alpine: `npm ci` → `npm run build` → runtime stage copying `.next/standalone` + `.next/static` + `public`, `node server.js`, non-root `nextjs` user) + `frontend/.dockerignore`.
- **Compose `frontend` service** — `Django-CRM/docker-compose.yml` gains a `frontend` service: build context `../frontend`, `DJANGO_API_URL=http://web:8000`, `ports 3000:3000`, `depends_on: web`. `docker-compose up --build` now starts db + web + frontend together.
- **DEBUG env-driven** — `dcrm/settings.py`: `DEBUG = os.environ.get('DEBUG', 'True') == 'True'` (dev default unchanged; `Django-CRM/.env` already ships `DEBUG=False` for prod).
- **`.env.example`** — new template for `SECRET_KEY`/`DEBUG`/`DB_*` (the README already referenced it but the file didn't exist).
- **Deprecation marker (D-03)** — `website/templates/base.html` carries an HTML comment marking the legacy Bootstrap templates deprecated in favor of `/frontend`.
- **CI** — `ci.yml` runs on `CRM/frontend/**` too and adds a `frontend` job (`setup-node 22` + npm cache, `npm ci`, `npm run lint`, `npm run build`).

### Verification

- `python -m pytest` — ✅ passes (2026-08-13).
- `npm run build` — ✅ passes (2026-08-13).
- `npm run lint` — ✅ passes (2026-08-13).
- `docker-compose up --build` — ✅ boots db + web + frontend (2026-08-13).
- e2e smoke via compose — ✅ register/login → dashboard stats → records CRUD → `/reports` (2026-08-13).
- Chunk B (docs pass) — ✅ completed 2026-08-13; `PHASE5_HANDOFF.md` deleted.


## Phase 4 — Records CRUD UI (2026-08-13)

**Status:** COMPLETED · **Gate:** `npm run build` + `npm run lint` pass; full CRUD against the API verified (user)

### Files touched

- `frontend/src/lib/types.ts` (new — shared `Record`/`RecordsPage`/`RecordPayload`/`StatsData` types)
- `frontend/src/components/crm/records-list.tsx` (new)
- `frontend/src/components/crm/record-form.tsx` (new)
- `frontend/src/components/crm/record-detail.tsx` (new)
- `frontend/src/components/crm/edit-record.tsx` (new)
- `frontend/src/app/records/page.tsx` (stub → real list)
- `frontend/src/app/records/new/page.tsx` (stub → real form)
- `frontend/src/app/records/[id]/page.tsx` (new)
- `frontend/src/app/records/[id]/edit/page.tsx` (new)
- `frontend/src/app/api/[...path]/route.ts` (trailing-slash fix, D-21)
- `frontend/src/proxy.ts` (dropped unused `event` param)
- `frontend/src/components/crm/recent-records.tsx` (refactor to shared types)
- `frontend/src/components/crm/stat-cards.tsx` (refactor to shared types)
- `mdfiles/PLAN.md` (Phase 3 → COMPLETED, Phase 4 → IN PROGRESS → COMPLETED)
- `mdfiles/DECISIONS.md` (D-19, D-20, D-21)
- `mdfiles/CHANGELOG.md`

### Changes made

- **Records list (`/records`)** — `RecordsList` replaces the stub: search `TextInput` (`?search=`, 350ms debounce), state `Select` populated from `/api/stats/` `by_state` (D-20), "Add record" button; Primer `DataTable` (Name/Email/City/State/Created/Actions) with server-side sort via `externalSorting` + `onToggleSort` → `?ordering=` (D-19, remounted by sort key so the sort caret tracks); Primer `Pagination` → `?page=` against the `{count,next,previous,results}` shape (page_size 20); `Blankslate` empty state; `Flash` error banner; per-row edit (`/records/[id]/edit`) and delete (`useConfirm` → `DELETE` → refetch, back a page if the last row on the page was removed).
- **Shared form (`record-form.tsx`)** — create/edit reuse: all 8 fields required, client-side trim + required/email validation, backend field-keyed errors mapped onto `FormControl.Validation` (register-page pattern), `non_field_errors` banner, loading submit button.
- **Create (`/records/new`)** — `RecordForm` → `POST /api/records/` → redirect to `/records/<id>` (confirmed decision).
- **Detail (`/records/[id]`)** — client page reads `params` via React `use(params)` (Next 16) → `RecordDetail` fetches `/api/records/<pk>`; all fields in a 3-col grid, Edit + Delete (`useConfirm`, danger) → `DELETE` → back to `/records`; 404 `Blankslate`; load-failure `Flash`.
- **Edit (`/records/[id]/edit`)** — client page reads `params` via `use(params)` → `EditRecord` prefills `RecordForm` → `PATCH /api/records/<pk>` → redirect to detail.
- **Shared types** — `src/lib/types.ts` extracted; `recent-records.tsx` and `stat-cards.tsx` now import from it (no behavior change).
- **Proxy trailing-slash fix (D-21)** — catch-all proxy now forwards `request.nextUrl.pathname` instead of `params.path.join('/')`, preserving the trailing slash DRF routes require. Previously GETs survived Django's `APPEND_SLASH` 301 (followed as GET) but POST/PATCH/DELETE would be converted to GET by `fetch` redirect handling, silently breaking create/update/delete.
- **Decisions** — D-19 (server-side sorting via `externalSorting`/`?ordering=`), D-20 (state filter from `/api/stats/` `by_state`), D-21 (proxy trailing-slash preservation).
- **Lint compliance** — removed synchronous `setState` calls from effect bodies (`react-hooks/set-state-in-effect`): `records-list.tsx` derives loading from `!data && !error` (stale rows stay visible during refetch); `record-detail.tsx`/`edit-record.tsx` reset state via `key={id}` remount from their parent pages instead of `setLoading(true)`/`setError(null)`; `proxy.ts` dropped the unused `event: NextFetchEvent` param (single-param signature per Next docs). Also fixed `useConfirm()` usage — the hook returns the `confirm` function itself, not `{ confirm }` (Primer types).
- **Prerender fix** — `npm run build` failed on `/records` with "Element type is invalid … got: undefined" (slot-based Primer `PageLayout`/`PageHeader` can't render from a Server Component, same root cause as the Phase 1 `stub-page` fix). Made `app/records/page.tsx` `'use client'` and converted `app/records/[id]/page.tsx` + `app/records/[id]/edit/page.tsx` to client components reading params via React `use(params)` (per Next 16 page docs); `key={id}` remount preserved.

### Verification

- `npm run build` — ✅ passes (2026-08-13); `npm run lint` — ✅ passes; e2e CRUD verified by user (list/search/filter/sort/paginate, create → detail redirect, edit → detail, delete → list, invalid-id 404).

## Phase 0 — Backend API additions (2026-08-11)

**Status:** COMPLETED · **Gate:** `python -m pytest` green

### Files touched

- `api/views.py`
- `api/urls.py`
- `api/serializers.py`
- `tests/conftest.py`
- `tests/test_stats.py` (new)
- `tests/test_auth.py`
- `tests/test_records.py`
- `mdfiles/CHANGELOG.md` (created)
- `mdfiles/PLAN.md`
- `mdfiles/DECISIONS.md`
- `mdfiles/FEATURES.md`
- `mdfiles/README.md`

### Changes made

- **Filters on `GET /api/records/`** — added DRF `SearchFilter` (`?search=` on `first_name`/`last_name`/`email`) and `OrderingFilter` (`?ordering=` over all fields) to `ListCreateRecordAPIView`; added exact `?state=` filter (case-insensitive) via a `get_queryset()` override (D-08). Response stays a plain JSON array unless paginated.
- **Opt-in pagination** — new `RecordPageNumberPagination` (`page_size=20`, `page_size_query_param=page_size`). `GET /api/records/?page=1` returns `{count, next, previous, results}`; without `?page=` the response remains the legacy plain array (D-07).
- **`GET /api/stats/`** — new `StatsAPIView` (token-gated, D-06) returning `total_records`, `records_this_week` (UTC week starting Monday), `records_this_month` (UTC calendar month), `distinct_states`, `by_state` (count per state, descending), `newest_record` (full object or `null`).
- **`GET /api/auth/me/`** — new `MeAPIView` (token-gated) returning `{id, username, email}` via a new `UserSerializer`.
- **Tests** — added `tests/test_stats.py`; extended `tests/test_auth.py` with `/api/auth/me/` cases; extended `tests/test_records.py` with search/state/ordering/pagination cases; added a `make_record` factory fixture to `tests/conftest.py`.

### Verification

- `python -m pytest` — all tests pass (existing 28 + new tests).

## Phase 1 — Frontend scaffold (2026-08-11)

**Status:** COMPLETED · **Gate:** `npm run build` passes; shell renders

### Files touched

- `frontend/package.json` / `package-lock.json` (added Primer deps, removed Tailwind)
- `frontend/next.config.ts` (env: `DJANGO_API_URL`)
- `frontend/postcss.config.mjs` (emptied — no Tailwind plugin)
- `frontend/src/app/records/page.tsx` (new stub)
- `frontend/src/app/records/new/page.tsx` (new stub)
- `frontend/src/components/crm/stub-page.tsx` (new)
- `frontend/src/components/crm/app-sidebar.tsx` (reworked nav)
- `frontend/public/placeholder.svg` (new — fixes broken Avatar src)
- `mdfiles/PLAN.md`
- `mdfiles/DECISIONS.md` (D-10)
- `mdfiles/FEATURES.md`

### Changes made

- **Design system** — adopted GitHub Primer (D-10, supersedes D-04): installed `@primer/react`, `@primer/octicons-react`, `styled-components`; removed `tailwindcss` / `@tailwindcss/postcss` and cleared `postcss.config.mjs`. Primer's `"use client"` + styled-components registry pattern matches the Next.js docs.
- **Shell nav** — `app-sidebar` reworked to the Phase 1 spec: Dashboard `/dashboard`, Records `/records`, Add Record `/records/new`, Logout (placeholder → `/login` until Phase 2).
- **Stub routes** — `/records` and `/records/new` render a shared `StubPage` (client component, matching the dashboard shell) so nav never 404s; real CRUD UI is Phase 4.
- **Assets** — added `public/placeholder.svg` (contacts-table Avatar previously 404'd).
- **Config** — `next.config.ts` exposes `DJANGO_API_URL` (default `http://localhost:8000`; used from Phase 2).
- **Build fix** — `stub-page.tsx` marked `'use client'` after prerender failed with "Element type is invalid … got: undefined" (slot-based Primer components can't render from a Server Component).

### Verification

- `npm run build` — passes; `/`, `/login`, `/dashboard`, `/records`, `/records/new` prerender.

## Phase 2 — Auth (BFF proxy + cookie) (2026-08-13)

**Status:** COMPLETED · **Gate:** `npm run build` passes; login/register/logout work end-to-end; unauthenticated redirects

### Files touched

- `frontend/src/lib/auth.ts` (new)
- `frontend/src/app/api/auth/login/route.ts` (new)
- `frontend/src/app/api/auth/register/route.ts` (new)
- `frontend/src/app/api/auth/logout/route.ts` (new)
- `frontend/src/app/api/[...path]/route.ts` (new)
- `frontend/src/proxy.ts` (new)
- `frontend/src/app/register/page.tsx` (new)
- `frontend/src/components/crm/auth-shell.tsx` (new)
- `frontend/src/app/login/page.tsx` (modified)
- `frontend/src/app/register/page.tsx` (modified)
- `frontend/src/components/crm/app-sidebar.tsx` (modified)
- `frontend/src/components/crm/top-bar.tsx` (modified)
- `mdfiles/PLAN.md`
- `mdfiles/DECISIONS.md`
- `mdfiles/CHANGELOG.md`

### Changes made

- **BFF proxy + httpOnly cookie auth** — `/api/auth/login`, `/api/auth/register` (auto-login on success), `/api/auth/logout` (clears cookie); catch-all `/api/[...path]` injects `Authorization: Token <dcrm_token>` from cookie.
- **Route protection** — `proxy.ts` guards `/dashboard`, `/records` (redirect to `/login` if no cookie) and `/login`, `/register` (redirect to `/dashboard` if cookie present).
- **Auth pages** — `/login` (username + password) and `/register` (username + optional email + password min 8) with Primer + subtle gradient accent (D-12).
- **Build fix #1** — `proxy.ts` exports `proxy` function (not `middleware`) per Next 16.3 Turbopack requirement.
- **Build fix #2** — removed `duplex: 'half'` from fetch in `/api/[...path]/route.ts` (TS2769: not in `RequestInit` type; body passes as-is).
- **Return-after-login** — `/login` now honors `?next=` set by `proxy.ts` (allowlist of in-app paths only, no open redirect); falls back to `/dashboard`. Wrapped in `Suspense` for `useSearchParams`.
- **Consistency** — `/register` refactored to reuse the shared `AuthShell` (gradient hero) instead of an inline `<main>`; removed unused `Checkbox` import.

### Verification

- `npm run build` — ✅ passes (2026-08-13); login/register/logout flow pending e2e test (incl. `/records` unauthenticated → `/login?next=/records` → login → lands on `/records`).
- **Build fix #3** — `login/page.tsx` TS2345: `isAllowedNext()` doesn't narrow `string | null`; compute `next` via a `&&` null-check so it's a guaranteed `string`.

## Phase 3 — Dashboard (stats cards) (2026-08-13)

**Status:** COMPLETED · **Gate:** `npm run build` + `npm run lint` pass; dashboard shows real data

### Files touched

- `frontend/src/components/crm/stat-cards.tsx` (rewritten — real data)
- `frontend/src/components/crm/recent-records.tsx` (new)
- `frontend/src/app/dashboard/page.tsx` (swap table + rename header)
- `mdfiles/PLAN.md`
- `mdfiles/CHANGELOG.md`

### Changes made

- **`StatCards` → real data** — rewired from hard-coded mock numbers to `fetch('/api/stats/')` through the BFF proxy. Cards now map to the token-gated aggregate: Total records (`total_records`, PeopleIcon), This week (`records_this_week`, PulseIcon), This month (`records_this_month`, CheckCircleIcon), Top state (`by_state[0].state` + count, GraphIcon). Loading/empty states handled (values show `…`/`—`).
- **New `RecentRecords` component** — fetches `/api/records/?ordering=-created_at` (plain-array response, D-07), slices to the 5 latest, renders a Primer `DataTable` with Name (first+last), Email, City, State, Created (formatted medium date) columns. Loading state before data arrives.
- **Dashboard page** — swapped `ContactsTable` (mock) → `RecentRecords`; renamed header "Contacts" → "Dashboard" and updated the description. `ContactsTable`/`lib/contacts.ts` left in place per the "keep mock data for now" decision.

### Verification

- ✅ Verified (2026-08-13) — `npm run build` + `npm run lint` pass; logged-in `/dashboard` shows real KPI values and the 5 latest records; empty DB shows `0`s and "No records yet".

## Reporting — API + page (2026-08-13)

**Status:** COMPLETED · **Gate:** `python -m pytest` green; `npm run build` + `npm run lint` pass

### Files touched

- `Django-CRM/api/views.py` (added `ReportAPIView`; `TruncMonth` import)
- `Django-CRM/api/urls.py` (`/api/reports/`)
- `Django-CRM/tests/test_reports.py` (new)
- `frontend/src/app/reports/page.tsx` (new)
- `frontend/src/components/crm/reports.tsx` (new)
- `frontend/src/components/crm/app-sidebar.tsx` (Reports nav item)
- `frontend/src/proxy.ts` (`/reports` protected)
- `mdfiles/PLAN.md`
- `mdfiles/FEATURES.md`
- `mdfiles/CHANGELOG.md`

### Changes made

- **`GET /api/reports/`** — new token-gated `ReportAPIView` (modeled on `StatsAPIView`): `total_records`, `records_per_month` (`TruncMonth` on `created_at`, ascending), `by_state` (count desc). Optional `?from=`/`?to=` ISO datetime range filters (`400` on invalid values).
- **`/reports` page** — new client page in the shell: summary stat cards + two Primer `DataTable` views (records per month, records by state); data fetched via BFF proxy from `/api/reports/`.
- **Nav + protection** — Reports added to the sidebar; `/reports` added to `protectedPaths`/matcher in `proxy.ts`.

### Verification

- ✅ COMPLETED — folded into the Phase 5 gate: `python -m pytest`, `npm run build`, `npm run lint`, and e2e smoke all pass (2026-08-13).
