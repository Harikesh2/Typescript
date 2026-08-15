# Django CRM — Next.js Frontend + DRF JSON API

A customer relationship management application structured as a monorepo: a Django backend (in `Django-CRM/`) exposing a Django REST Framework JSON API, and a Next.js frontend (in `frontend/`) consuming it. The backend also retains the original server-rendered Bootstrap UI (now deprecated) for backward compatibility during the migration.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Backend (Django)](#backend-django)
  - [Frontend (Next.js)](#frontend-nextjs)
- [Docker Deployment](#docker-deployment)
- [Usage](#usage)
  - [REST API](#rest-api)
  - [Frontend Routes](#frontend-routes)
  - [Legacy Web Routes](#legacy-web-routes-deprecated)
- [Configuration Reference](#configuration-reference)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [Documentation](#documentation)
- [License](#license)

## Features

- **DRF JSON API** — Full CRUD for records under `/api/records/`, secured by DRF Token authentication (writes require a token; reads are public).
- **Search, filtering & sorting** — `?search=`, `?state=`, `?ordering=` on the records list, plus opt-in `?page=` pagination.
- **Dashboard API** — `GET /api/stats/` returns aggregates (totals for week/month, counts by state) for the frontend dashboard.
- **Auth API** — `POST /api/auth/register/` and `/api/auth/token/` issue tokens; `GET /api/auth/me/` returns the current user.
- **Next.js frontend** — App Router + TypeScript app built on GitHub Primer, with login, register, dashboard, and records routes.
- **BFF proxy auth** — Browser JS never touches the token: the Next.js proxy stores it in an httpOnly cookie and injects `Authorization: Token <key>` on proxied API calls.
- **Legacy UI (deprecated)** — The original server-rendered Bootstrap/Django-template pages still work but are slated for removal (see [DECISIONS.md](Django-CRM/mdfiles/DECISIONS.md) D-03).
- **Test suite** — pytest + pytest-django on in-memory SQLite (no local database needed).
- **CI** — monorepo workflow at [`../.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs the backend suite (`python -m pytest`) on every push/PR to `main` affecting `CRM/Django-CRM/**`.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 4.1 (Python) |
| API | Django REST Framework + Token Auth |
| Database | PostgreSQL 16 (tests use in-memory SQLite) |
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Frontend UI | GitHub Primer (`@primer/react`) + `styled-components` |
| Web Server | Gunicorn (backend), Next.js (frontend) |
| Static Files | WhiteNoise |
| Testing | pytest, pytest-django |
| Containerization | Docker / docker-compose (db + backend + frontend) |

## Project Structure

```
CRM/
├── README.md                   # This file
├── Django-CRM/                 # Django backend
│   ├── Dockerfile              # Python 3.12 image + gunicorn
│   ├── docker-compose.yml      # PostgreSQL 16 + web + frontend services
│   ├── manage.py               # Django management CLI
│   ├── mydb.py                 # Orphaned MySQL helper script (unused after D-24)
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment template
│   ├── pytest.ini              # pytest config (dcrm.settings_test)
│   ├── conftest.py             # Enables in-memory SQLite for tests
│   ├── dcrm/                   # Django project configuration package
│   │   ├── settings.py         # Project settings (env-driven)
│   │   ├── settings_test.py    # Test-specific settings
│   │   ├── urls.py             # Root URL configuration (mounts /api/)
│   │   ├── wsgi.py             # WSGI entrypoint
│   │   └── asgi.py             # ASGI entrypoint
│   ├── website/                # Legacy server-rendered app (deprecated)
│   │   ├── models.py           # Record model
│   │   ├── views.py            # Function-based views
│   │   ├── forms.py            # SignUpForm and AddRecordForm
│   │   ├── admin.py            # Admin registration
│   │   ├── urls.py             # App URL routes
│   │   ├── migrations/         # Database migrations
│   │   └── templates/          # Bootstrap HTML templates (deprecated)
│   ├── api/                    # DRF JSON API app
│   │   ├── views.py            # API views (records, stats, auth)
│   │   ├── serializers.py      # RecordSerializer, UserSerializer, ...
│   │   └── urls.py             # /api/ routes
│   ├── tests/                  # pytest suite (in-memory SQLite)
│   │   ├── conftest.py         # Shared fixtures (test_user, auth_client)
│   │   ├── test_auth.py        # register / token / me
│   │   ├── test_records.py     # CRUD + search / state / ordering / pagination
│   │   └── test_stats.py       # /api/stats/ aggregates
│   └── mdfiles/                # Feature documentation (see Documentation)
│       ├── README.md           # API surface & quick start
│       ├── FEATURES.md         # Feature registry
│       ├── PLAN.md             # Working plan & phases
│       ├── CHANGELOG.md        # Per-phase changelog
│       └── DECISIONS.md        # Technical decision log
└── frontend/                   # Next.js frontend
    ├── package.json            # Next.js 16, React 19, Primer, styled-components
    ├── next.config.ts          # output: 'standalone'; DJANGO_API_URL at runtime
    ├── Dockerfile              # Multi-stage standalone image (node:22-alpine)
    ├── .dockerignore
    ├── eslint.config.mjs
    ├── tsconfig.json
    ├── public/                 # Static assets
    └── src/
        ├── app/                # App Router pages & API routes
        │   ├── login/          # Login page
        │   ├── register/       # Register page
        │   ├── dashboard/      # Dashboard page
        │   ├── records/        # Records list + new-record stub
        │   ├── api/auth/       # BFF handlers: login / register / logout
        │   ├── api/[...path]/  # Catch-all proxy to the Django API
        │   ├── page.tsx        # Root redirect
        │   └── layout.tsx      # Root layout + providers
        ├── components/         # React components
        │   ├── crm/            # App sidebar, top bar, stat cards, contacts table, ...
        │   ├── providers.tsx   # Primer / styled-components providers
        │   └── styled-components-registry.tsx
        ├── lib/                # auth.ts (BFF helpers), contacts.ts (mock data)
        └── proxy.ts            # Route protection (Next 16 proxy convention)
```

## Getting Started

### Backend (Django)

```bash
# 1. Create a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables (see Configuration Reference)
cp .env.example .env

# 4. Create the database (either option) and apply migrations
python mydb.py                  # or manually: CREATE DATABASE elderco ...
python manage.py migrate

# 5. (Optional) Create an admin user
python manage.py createsuperuser

# 6. Run the server
python manage.py runserver
```

The API is available at <http://127.0.0.1:8000/api/> (browsable API root) and the legacy UI at <http://127.0.0.1:8000/>.

### Frontend (Next.js)

```bash
# From the repo root
cd frontend

# 1. Install dependencies
npm install

# 2. (Optional) Point the proxy at your backend if not on the default
#    DJANGO_API_URL=http://localhost:8000 (runtime env, dev default; required in production, see D-26)

# 3. Run the development server
npm run dev
```

The frontend is available at <http://localhost:3000>. The backend must be running on `DJANGO_API_URL` for auth and data calls to work.

## Docker Deployment

A `docker-compose.yml` in `Django-CRM/` runs PostgreSQL, the Django web service, and the Next.js frontend together:

```bash
cd Django-CRM
docker-compose up --build
```

This starts:

- **db** — PostgreSQL 16 with a healthcheck and a persistent `postgres_data` volume.
- **web** — builds the Django app; its entrypoint runs migrations + the schema healthcheck, then serves the API via Gunicorn on port 8000.
- **frontend** — builds the Next.js standalone image and serves it on port 3000; it reaches the API at `http://web:8000`.

`DJANGO_API_URL` is read at runtime (D-22), so the backend URL can be overridden without a rebuild, e.g. `docker-compose up -e DJANGO_API_URL=https://api.example.com`.

## Usage

### REST API

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/api/records/` | public read | List records; `?search=`, `?state=`, `?ordering=`, opt-in `?page=` |
| POST | `/api/records/` | token required | Create record |
| GET | `/api/records/<pk>/` | public read | Record detail |
| PUT/PATCH | `/api/records/<pk>/` | token required | Full / partial update |
| DELETE | `/api/records/<pk>/` | token required | Delete record |
| GET | `/api/stats/` | token required | Dashboard aggregates (total, week, month, states) |
| POST | `/api/auth/register/` | public | Create user, returns token |
| GET | `/api/auth/me/` | token required | Current user `{id, username, email}` |
| POST | `/api/auth/token/` | public | Obtain token (username/password) |

Writes require DRF Token auth (`HTTP_AUTHORIZATION: Token <key>`); reads are public. `/api/stats/` and `/api/auth/me/` require token auth.

### Frontend Routes

| Route | Description | Auth Required |
|---|---|---|
| `/` | Redirects to `/login` | No |
| `/login` | Log in with username + password | No (redirects to `/dashboard` when logged in) |
| `/register` | Create an account (auto-login on success) | No (redirects to `/dashboard` when logged in) |
| `/dashboard` | KPI stat cards + recent records (live) | Yes |
| `/records` | Searchable / filterable / sortable records table with pagination + edit/delete | Yes |
| `/records/new` | Create-record form | Yes |
| `/records/[id]` | Record detail + delete | Yes |
| `/records/[id]/edit` | Edit-record form | Yes |
| `/reports` | Summary stats + tables (records per month, records by state) | Yes |

### Legacy Web Routes (deprecated)

| Route | Description | Auth Required |
|---|---|---|
| `/` | Home — login form (guest) or record list (authenticated) | No |
| `/register/` | Create a new user account | No |
| `/logout/` | Log out the current user | Yes |
| `/record/<id>/` | View a single record's details | Yes |
| `/add_record/` | Create a new record | Yes |
| `/update_record/<id>/` | Edit an existing record | Yes |
| `/delete_record/<id>/` | Delete a record | Yes |
| `/admin/` | Django admin interface | Staff |

> These Bootstrap/Django-template pages are **deprecated** and will be removed once the Next.js frontend covers their functionality (D-03).

## Configuration Reference

### Backend

All backend configuration is environment-driven. Key settings in `Django-CRM/dcrm/settings.py`:

| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | Django secret key | Required for production |
| `DEBUG` | Debug mode toggle | `True` (env-driven; see note below) |
| `DB_NAME` | PostgreSQL database name | — |
| `DB_USER` | PostgreSQL username | — |
| `DB_PASSWORD` | PostgreSQL password | — |
| `DB_HOST` | PostgreSQL host | — |
| `DB_PORT` | PostgreSQL port | `5432` |
| `ALLOWED_HOSTS` | Allowed hostnames | Railway + localhost |

> **Note:** `DEBUG` is env-driven via the `DEBUG` variable (`True` by default in dev); see `Django-CRM/.env.example` for the template. Set it to `False` before production deployment.

### Frontend

| Variable | Description | Default |
|---|---|---|
| `DJANGO_API_URL` | Backend base URL used by the BFF proxy | `http://localhost:8000` (dev only) |

Read at runtime by the BFF proxy (D-22). **Required in production**: if unset with `NODE_ENV=production`, the app fails fast with `DJANGO_API_URL is required in production` rather than silently falling back to localhost (D-26). Dev default `http://localhost:8000`; override via an environment variable (e.g. compose `DJANGO_API_URL=http://web:8000`).

## Testing

### Backend

Tests live in `Django-CRM/tests/` and run with pytest against in-memory SQLite (no local database required):

```bash
cd Django-CRM
python -m pytest
```

> **CI:** the monorepo workflow at [`../.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs the backend suite on every push/PR to `main` when paths under `CRM/Django-CRM/` change (Python 3.12).

### Frontend

```bash
cd frontend
npm run build      # type-checks and builds all routes
npm run lint       # ESLint
```

## Roadmap

The project follows a phased plan tracked in `Django-CRM/mdfiles/PLAN.md`:

- **Phase 0 — Backend API additions** ✅ Completed
- **Phase 1 — Frontend scaffold** ✅ Completed
- **Phase 2 — Auth (BFF proxy + cookie)** ✅ Completed
- **Phase 3 — Dashboard (real stats data)** ✅ Completed
- **Phase 4 — Records CRUD UI** ✅ Completed
- **Phase 5 — Polish, deploy, deprecate legacy UI** ✅ Completed
- **Reporting (API + page)** ✅ Completed

## Documentation

Project docs live in `Django-CRM/mdfiles/`:

- [README.md](Django-CRM/mdfiles/README.md) — API surface & quick start
- [FEATURES.md](Django-CRM/mdfiles/FEATURES.md) — Feature registry
- [PLAN.md](Django-CRM/mdfiles/PLAN.md) — Working plan & phases
- [CHANGELOG.md](Django-CRM/mdfiles/CHANGELOG.md) — Per-phase changelog
- [DECISIONS.md](Django-CRM/mdfiles/DECISIONS.md) — Technical decision log

## License

This project is part of the broader `App/Typescript` workspace. See the repository root for license details.
