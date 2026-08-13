# AGENTS.md — Django CRM monorepo

Project context for agents. Read once per session; refer to this instead of re-reading project files.

## What this is

A CRM monorepo with two apps:
- `Django-CRM/` — Django 4.1 backend + Django REST Framework. JSON API under `/api/`. Token auth (`rest_framework.authtoken`), no CORS (BFF proxy handles auth). Legacy Bootstrap templates in `website/templates/` still exist but are deprecated (D-03).
- `frontend/` — Next.js 16 (App Router, Turbopack) + TypeScript + GitHub Primer (`@primer/react` + `@primer/primitives` + `styled-components`). Talks to the Django API through a BFF proxy (cookie `dcrm_token`).

## Repo layout

- `Django-CRM/api/` — DRF views (`views.py`), `urls.py`, `serializers.py`.
  - `GET /api/records/` — list/create; filters `?search=`, `?state=`, `?ordering=`; opt-in pagination `?page=` (`{count,next,previous,results}`, else plain array, D-07)
  - `GET/PUT/PATCH/DELETE /api/records/<pk>/`
  - `GET /api/stats/` — token-gated aggregates (total/week/month, by_state, newest_record)
  - `GET /api/reports/` — token-gated report aggregates: `records_per_month`, `by_state`, `total_records`, `from`/`to` range filter
  - `POST /api/auth/register/`, `POST /api/auth/token/`, `GET /api/auth/me/`
- `Django-CRM/website/` — legacy Django app: `models.py` (`Record`), templates, admin. **No model/migration changes** — API is additive only.
- `Django-CRM/tests/` — pytest; fixtures in `conftest.py` (`test_user`, `make_record`, `api_client`, `auth_client`).
- `Django-CRM/mdfiles/` — `PLAN.md` (plan + phase status), `DECISIONS.md` (D-XX log), `CHANGELOG.md` (single changelog), `FEATURES.md` (feature registry), `README.md`.
- `frontend/src/` — Next.js app.
  - `src/app/` routes: `/login`, `/register`, `/dashboard`, `/records`, `/records/new`, `/reports`; BFF handlers under `src/app/api/` (auth + catch-all `[...path]` proxy)
  - `src/components/crm/` — `top-bar.tsx`, `app-sidebar.tsx`, `stat-cards.tsx`, `contacts-table.tsx`, `stub-page.tsx`, `auth-shell.tsx`
  - `src/lib/auth.ts` — cookie + API URL helpers; `src/lib/contacts.ts` — mock data (Phase 1)
  - `src/proxy.ts` — route protection (Next 16 `proxy` export, **not** `middleware.ts`, D-18)
- `frontend/AGENTS.md` — auto-generated Next.js agent rules block; leave it alone.

## Workflow (mandatory)

1. `mdfiles/PLAN.md` is the single source of truth for the plan + phase status.
2. Every technical decision goes in `DECISIONS.md` (rationale, date, status, D-XX numbering).
3. Log ALL changes per phase in a **single** `mdfiles/CHANGELOG.md` (files touched, changes, verification). Never create per-phase `.md` files.
4. Implement ONE phase at a time. Status: NOT STARTED → IN PROGRESS → COMPLETED.
5. On completion: run the phase gate, update `FEATURES.md`, then move to the next phase.
6. No scope creep — anything new = new decision + new phase.

## Conventions

- **Auth** — BFF proxy only: browser never holds the DRF token; Next route handlers store it in `dcrm_token` httpOnly cookie and inject `Authorization: Token <key>` on proxied calls. No CORS. `ALLOWED_HOSTS` covers localhost.
- **Cookie** — `dcrm_token`, httpOnly, sameSite=lax, secure in prod, maxAge 30 days (`src/lib/auth.ts`).
- **Route protection** — `src/proxy.ts` exports `proxy` (Next 16.3, D-18). Unauthenticated → redirect to `/login`; authenticated on `/login`/`/register` → redirect to `/dashboard`.
- **Design** — GitHub Primer (D-10 supersedes D-04 pastel plan). All page components that use Primer are `'use client'`.
- **Reports/stats endpoints** — token-gated (`IsAuthenticated`), pure aggregates, no charts (charts deferred, D-05).
- **Pagination** — opt-in `?page=`, keeps plain-array tests green.

## Commands

- Backend: `python -m pytest` (from `Django-CRM/`; in-memory SQLite via `USE_SQLITE=1`, never MySQL)
- Frontend: `npm run build`, `npm run lint` (from `frontend/`); `npm run dev` for local dev
- Backend dev server: `python manage.py runserver` (port 8000); frontend expects `DJANGO_API_URL` (default `http://localhost:8000`)
- **Do NOT run gates yourself** — the user runs `pytest`/`build`/`lint` manually in a separate debugging session. Implement, mark verification as pending, and report.

## Phase status snapshot (from PLAN.md)

- Phase 0 Backend API additions — COMPLETED
- Phase 1 Frontend scaffold — COMPLETED
- Phase 2 Auth (BFF proxy + cookie) — COMPLETED
- Phase 3 Dashboard (stats cards) — COMPLETED
- Phase 4 Records CRUD UI — COMPLETED
- Phase 5 Polish, deploy, deprecate — COMPLETED
- Reporting (API + page) — COMPLETED (additional feature on top of the plan phases)

## Notable decisions (full list in DECISIONS.md)

D-02 BFF proxy auth (no CORS) · D-05 charts deferred to v2 · D-06 stats/reports token-gated · D-07 opt-in pagination · D-10 Primer design system · D-14/D-18 Next 16 `proxy.ts` not `middleware.ts` · D-15 logout = client-side cookie clear
