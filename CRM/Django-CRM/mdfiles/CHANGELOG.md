# CHANGELOG — Django CRM Next.js Frontend

> Single changelog for all phase changes. Created once; append per phase. Follows `PLAN.md` (one phase at a time).

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

**Status:** IN PROGRESS · **Gate:** login/register/logout work end-to-end; unauthenticated redirects

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

### Verification

- `npm run build` — pending (user runs manually); login/register/logout flow pending e2e test.

## Reporting — API + page (2026-08-13)

**Status:** IN PROGRESS · **Gate:** `python -m pytest` green; `npm run build` + `npm run lint` pass

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

- Pending — user runs `python -m pytest`, `npm run build`, `npm run lint` manually.
