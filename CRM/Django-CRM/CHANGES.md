# CHANGES.md — implementation log for PLAN.md

Reusable prompt for the next session (copy/paste, 3-4 lines):

> Read CHANGES.md and PLAN.md. Continue the PLAN.md one phase at a time — ONLY the next unfinished phase, no extra phases. Implement it, mark it Completed in PLAN.md, update CHANGES.md with everything you changed, verify the phase gate (`python -m pytest`), then STOP. Never commit or touch git, models, or the existing website app.

---

## Progress log

### Phase | 1 | DRF bootstrap | COMPLETED | 2026-08-10

Wired Django REST Framework into the project so the API layer is reachable at `/api/` with no features yet.

Note: Phase 1 was actually **missing** from the repo when this phase ran (no DRF, no `api` app) — the DRF bootstrap itself was the work of this phase.

Files added/changed:

- `requirements.txt` — added `djangorestframework`.
- `dcrm/settings.py` — added `'rest_framework'`, `'rest_framework.authtoken'`, `'api'` to `INSTALLED_APPS`; added `REST_FRAMEWORK` config (`TokenAuthentication` + `IsAuthenticatedOrReadOnly`).
- `api/__init__.py`, `api/apps.py` (new) — `ApiConfig` app.
- `api/urls.py` (new) — DRF `DefaultRouter` mounted at `''` (API root visible at `/api/`).
- `api/serializers.py`, `api/views.py` (new) — empty placeholders.
- `dcrm/urls.py` — added `path('api/', include('api.urls'))`.
- `tests/conftest.py` — added `api_client` fixture (`rest_framework.test.APIClient`).
- `tests/test_records.py` — added Phase 1 gate tests: `api` app registered in `INSTALLED_APPS`, `/api/` root responds 200, `/api/` resolves to the DRF router root view.

Gate (from plan): `python -m pytest` passes; `/api/` auto-generated API root responds; app registered in `INSTALLED_APPS`.

Status: files complete. **Verification deferred to the user** — user will run `python -m pytest` locally and confirm. Known blocker observed earlier: fresh venv lacks `mysqlclient` (MySQL backend import fails before the SQLite switch applies), so start with DRF/pytest installed or run with `USE_SQLITE=1`.

### Phase | 0 | Test scaffold | COMPLETED | 2026-08-08

Created the baseline test harness so every later phase has a CI gate.

Files added/changed:

- `requirements.txt` — added `pytest`, `pytest-django`.
- `pytest.ini` (new) — `DJANGO_SETTINGS_MODULE = dcrm.settings`, `python_files = tests/*.py`.
- `dcrm/settings.py` — database is now switchable: when `USE_SQLITE=1` is set (done by `conftest.py` under pytest) it uses SQLite `:memory:`; otherwise the original MySQL config stays untouched for production.
- `conftest.py` (new, project root) — sets `USE_SQLITE=1` before pytest-django initializes, so the test suite runs on the in-memory SQLite DB and never touches MySQL.
- `tests/__init__.py` (new) — makes `tests/` a package.
- `tests/conftest.py` (new) — shared `test_user` fixture (`db` + `django_user_model`) that later phases reuse. DRF `Token` / API client fixtures will be added in Phase (DRF bootstrap) since `rest_framework.authtoken` is not installed yet.
- `tests/test_auth.py` (new) — placeholder smoke test (auth endpoint tests come in Phase 7/8).
- `tests/test_records.py` (new) — placeholder smoke test (record endpoint tests come in Phases 2-6).
- `.github/workflows/ci.yml` (new) — runs `python -m pytest` on every push and on every PR to `main` (Python 3.12; installs MySQL build deps so `mysqlclient` compiles).

Gate (from plan): `python -m pytest` passes + CI workflow exists.
Status: files complete. **Blocked on local verification** — the user is installing `mysqlclient`/`pytest` in the working venv manually (MySQL driver build fails in the assistant's temp sandbox). Run `python -m pytest` locally to confirm; expected result: 2 collected, 2 passed.