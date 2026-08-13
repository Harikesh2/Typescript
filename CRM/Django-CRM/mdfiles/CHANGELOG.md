# CHANGELOG — Django CRM Next.js Frontend

> Single changelog for all phase changes. Created once; append per phase. Follows `PLAN.md` (one phase at a time).

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
