# Django CRM

A lightweight, server-rendered customer relationship management application built with Django and MySQL. The application provides user authentication (register, login, logout) and full CRUD operations for customer contact records.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Run the Server](#run-the-server)
- [Docker Deployment](#docker-deployment)
- [Usage](#usage)
- [Configuration Reference](#configuration-reference)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [License](#license)

## Features

- **User Authentication** — Register new accounts, log in, and log out using Django's built-in session authentication.
- **Contact Management (CRUD)** — Create, read, update, and delete customer records.
- **Record Details** — View a full detail page for each customer record.
- **Responsive UI** — Bootstrap 5 frontend with server-rendered Django templates.
- **Django Admin** — Manage records through the built-in admin interface.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django (Python) |
| Database | MySQL 8.0 |
| Frontend | Django Template Language + Bootstrap 5 (CDN) |
| Web Server | Gunicorn |
| Static Files | WhiteNoise |
| Containerization | Docker / docker-compose |

## Project Structure

```
CRM/
├── Dockerfile                  # Python 3.12 image + gunicorn, port 8000
├── docker-compose.yml          # MySQL 8.0 + web service with auto-migrate
├── manage.py                   # Django management CLI
├── mydb.py                     # Standalone script to create the MySQL database
├── requirements.txt            # Python dependencies
├── dcrm/                       # Django project configuration package
│   ├── settings.py             # Project settings (env-driven)
│   ├── urls.py                 # Root URL configuration
│   ├── wsgi.py                 # WSGI entrypoint
│   └── asgi.py                 # ASGI entrypoint
└── website/                    # Core application
    ├── models.py               # Record model
    ├── views.py                # Function-based views
    ├── forms.py                # SignUpForm and AddRecordForm
    ├── admin.py                # Admin registration
    ├── urls.py                 # App URL routes
    ├── migrations/             # Database migrations
    └── templates/              # HTML templates
```

## Getting Started

### Prerequisites

- Python 3.12+
- MySQL 8.0 (local or containerized)
- pip

### Installation

```bash
# 1. Create a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables (see Configuration Reference)
cp .env.example .env
```

### Database Setup

Create the database either manually or via the provided script:

```bash
# Option A: Using the helper script
python mydb.py

# Option B: Manually
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS elderco CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Then apply migrations:

```bash
python manage.py migrate
```

Create an admin user (optional):

```bash
python manage.py createsuperuser
```

### Run the Server

```bash
python manage.py runserver
```

The application is available at <http://127.0.0.1:8000/>.

## Docker Deployment

A `docker-compose.yml` is provided to run MySQL and the web service together:

```bash
docker-compose up --build
```

This starts:

- **MySQL 8.0** — with a healthcheck and a persistent `mysql_data` volume.
- **web** — builds the Django app, runs migrations automatically, and serves it via Gunicorn on port 8000.

## Usage

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

## Configuration Reference

All configuration is environment-driven. Key settings in `dcrm/settings.py`:

| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | Django secret key | Required for production |
| `DEBUG` | Debug mode toggle | `True` (see note below) |
| `DB_NAME` | MySQL database name | — |
| `DB_USER` | MySQL username | — |
| `DB_PASSWORD` | MySQL password | — |
| `DB_HOST` | MySQL host | — |
| `DB_PORT` | MySQL port | `3306` |
| `ALLOWED_HOSTS` | Allowed hostnames | Railway + localhost |

> **Note:** `DEBUG` is currently hardcoded to `True` in `settings.py:7`. The env-driven toggle is commented out. Set it to `False` before production deployment.

## Testing

Tests live in `website/tests.py` and run with Django's built-in test runner:

```bash
python manage.py test
```

> **Note:** No test cases are currently implemented.

## Roadmap

- Introduce leads, deals, and pipeline tracking.
- Add record ownership and role-based access control.
- Add pagination, search, and filtering on the record list.
- Expose a REST API (Django REST Framework).
- Add automated test coverage and CI.
- Add a dashboard and reporting views.

## License

This project is part of the broader `App/Typescript` workspace. See the repository root for license details.
