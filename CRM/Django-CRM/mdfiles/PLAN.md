# PLAN — Next.js Frontend + Dashboard for Django CRM

> Working plan for the next feature round.

## Workflow (strict — mandatory)

1. PLAN.md is the single source of truth for the plan + phase status.
2. Every technical decision is logged in `DECISIONS.md` with the rationale (why), date, and status.
3. For EVERY phase, **log all changes in a single file: `CHANGELOG.md`** (create it once if it doesn't exist). Append each phase's changes with:
   - Phase number and name
   - Files touched
   - Changes made
   - Verification steps
   Do **NOT** create separate per-phase `.md` files.
4. Implement ONE phase at a time. Mark status in `PLAN.md`: NOT STARTED → IN PROGRESS → COMPLETED.
5. On completion: run the phase gate, update `FEATURES.md`, then move to the next phase.
6. Do not let a phase leak into the next. Any scope creep = new decision + new phase.

## Goal

Replace the Bootstrap/Django-template UI with a Next.js (App Router, TypeScript) frontend in `frontend/`, backed by the existing DRF API, with a light + soft pastel gradient dashboard. Auth via BFF proxy + httpOnly cookie (token never in browser JS, no CORS).

## Repo analysis (findings)

- Backend: Django 4.1 + DRF Token auth; `/api/records/` CRUD now supports search/ordering/`state` filters + opt-in `?page=` pagination (Phase 0); `/api/auth/register/`, `/api/auth/token/`, `/api/stats/`, `/api/auth/me/`.
- `tests/test_records.py` asserts `/api/records/` returns a plain array → pagination must be opt-in (D-07).
- No CORS middleware; not needed with BFF proxy (D-02).
- `ALLOWED_HOSTS` covers localhost → zero backend host changes for the proxy.
- DRF token auth is CSRF-exempt → no CSRF handling for the proxy.
- Tests run on in-memory SQLite via `USE_SQLITE=1` (`tests/conftest.py`); must stay green.

## Decisions

See `DECISIONS.md` for full rationale. Summary: frontend in-repo at /frontend (D-01); BFF proxy + httpOnly cookie (D-02); keep legacy templates (D-03); Primer design system, superseding the original pastel plan (D-04→D-10); stats cards first, charts deferred (D-05); /api/stats/ token-gated (D-06); opt-in pagination, minimal (D-07); state filter via queryset override (D-08); stats windows UTC week/month (D-09).

## Phases

### Phase 0 — Backend API additions — ✅ COMPLETED (2026-08-11)

- Add SearchFilter/OrderingFilter + `state` filter to `ListCreateRecordAPIView` (response stays array).
- Opt-in pagination: `{count, results}` only when `?page=` present (D-07).
- New `GET /api/stats/` (token-gated, D-06): total_records, records_this_week, records_this_month, distinct_states, by_state, newest_record.
- New `GET /api/auth/me/` → {id, username, email} for navbar user chip.
- New tests (`tests/test_stats.py`, extend auth tests); update FEATURES.md.
- **Gate:** `python -m pytest` green.

### Phase 1 — Frontend scaffold — ✅ COMPLETED (2026-08-11)

- Next.js (App Router, TypeScript) app in `frontend/`; Primer design system (D-10) via `@primer/react` + `@primer/primitives` tokens + `styled-components` registry (Tailwind v4 removed).
- Shell layout: sidebar (Dashboard, Records, Add Record, Logout) + topbar with user chip.
- Routes: `/` → redirect `/login` (UI-only placeholder); `/dashboard` (mock stat cards + contacts table); `/records` + `/records/new` stubs. `next.config.ts` carries `DJANGO_API_URL`.
- **Gate:** `npm run build` passes; shell renders.

### Phase 2 — Auth (BFF proxy + cookie) — ✅ COMPLETED (2026-08-13)

- Route handlers: `/api/auth/login|register|logout` (register auto-login); catch-all `/api/[...path]` proxy injecting `Authorization: Token <cookie>`.
- `proxy.ts` route protection; login + register pages (gradient hero).
- Cookie `dcrm_token`: httpOnly, secure in prod, sameSite=lax.
- Login honors `?next=` (in-app allowlist, no open redirect).
- **Gate:** `npm run build` passes (login/register/logout flow verified e2e).

### Phase 3 — Dashboard (stats cards) — ✅ COMPLETED (2026-08-13)

- `/dashboard` fetches `/api/stats/` + recent records → KPI cards (Total, This Week, This Month, Top State) + recent-records preview.
- `StatCards` rewired to `/api/stats/` (People/Pulse/CheckCircle/Graph icons); new `RecentRecords` component fetches `/api/records/?ordering=-created_at` (plain-array slice of 5); dashboard header renamed "Contacts" → "Dashboard".
- **Gate:** `npm run build` passes (verified by user); dashboard shows real data.

### Phase 4 — Records CRUD UI — ✅ COMPLETED (2026-08-13)

- `/records` table: search (name/email), state filter, sort, pagination; `/records/[id]` detail; `/records/new` + `/records/[id]/edit` forms (validation + toasts); delete confirm.
- `records-list.tsx` (DataTable + search/state/sort via `?search=`/`?state=`/`?ordering=`, Primer `Pagination` via `?page=`, per-row edit/delete); shared `record-form.tsx` (create/edit); `record-detail.tsx` (+ ConfirmationDialog delete, D-19); state dropdown sourced from `/api/stats/` `by_state` (D-20).
- **Gate:** `npm run build` + `npm run lint` pass; full CRUD against the API verified (user).

### Phase 5 — Polish, deploy, deprecate — ✅ COMPLETED (2026-08-13)

- `npm run build` + lint clean; pytest green; frontend Dockerfile + compose service (or Railway note).
- Mark `website/templates` deprecated (D-03); update PLAN.md/FEATURES.md/README.md.
- **Gate:** all checks pass; run instructions documented.

### Reporting — API + page — ✅ COMPLETED (2026-08-13) (additional feature)

- New `GET /api/reports/` (token-gated): `records_per_month` (created_at grouped by month), `by_state` (counts), `total_records`, optional `?from=`/`?to=` date-range filter.
- Frontend `/reports` route: stat cards + `DataTable` views (monthly counts, state breakdown); sidebar link.
- **Gate:** `python -m pytest` green; `npm run build` + `npm run lint` pass.

## Out of scope / handled elsewhere

- Charts/recharts (D-05, deferred to v2), full server-pagination rollout, dark mode, RBAC, leads/deals.
