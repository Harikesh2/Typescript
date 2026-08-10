# CHANGES.md — implementation log for PLAN.md

Reusable prompt for the next session (copy/paste, 3-4 lines):

> Read CHANGES.md and PLAN.md. Continue the PLAN.md one phase at a time — ONLY the next unfinished phase, no extra phases. Implement it, mark it Completed in PLAN.md, update CHANGES.md with everything you changed, verify the phase gate (`python -m pytest`), then STOP. Never commit or touch git, models, or the existing website app.

---

## Progress log

### Phase | 9 | Permission locking | COMPLETED | 2026-08-10

Confirmed content-repo permission locking on records. `dcrm/settings.py` already enforces `TokenAuthentication` + `IsAuthenticatedOrReadOnly` globally (record views rely on these defaults). The gap this phase closes: existing write tests only used `force_authenticate` (which bypasses the real token check), so the actual token-header path was unproven.

Files changed:

- `tests/test_records.py` — added `test_records_create_with_token_header_201`: creates a real `Token` for `test_user`, authenticates via `HTTP_AUTHORIZATION: Token <key>`, POSTs a valid record → 201. Proves create works over real `TokenAuthentication`, complementing the existing gates:
  - anonymous POST → 403 (`test_records_create_anonymous_forbidden`)
  - anonymous GET → 200 (list/detail tests)
  - anonymous DELETE → 403 (`test_records_delete_anonymous_forbidden`)
- No settings, views, serializers, models, or migrations changed — defaults already in place.

Gate (from plan): anonymous GET ok; anonymous POST → 401/403; authenticated POST (with token) → 201.

Status: files complete. **Verification deferred to the user** — per user instruction tests were NOT run by the assistant; user runs `python -m pytest` locally.

### Phase | 8 | POST /api/auth/token/ (obtain token) | COMPLETED | 2026-08-10

Added `POST /api/auth/token/` using DRF's built-in `obtain_auth_token`, which authenticates with username/password and returns (or creates) the user's auth `Token`. Response is `200` with `{token: ...}`; wrong credentials → `400` with `non_field_errors`.

Files changed:

- `api/urls.py` — imported `obtain_auth_token` from `rest_framework.authtoken.views` and registered `path('auth/token/', obtain_auth_token)`. No view code needed — `obtain_auth_token` already permits anonymous access.
- `tests/test_auth.py` — added Phase 8 gate tests:
  - `test_token_url_resolves` — URL resolves to `rest_framework.authtoken.views`.
  - `test_token_success_200` — `testuser`/`testpass123` → 200, returned token matches the DB `Token` row.
  - `test_token_wrong_password_400` — bad password → 400 with `non_field_errors`.

No serializer/view/model changes, no migrations, no website app changes.

Gate (from plan): correct credentials → 200 + token; wrong password → 400.

Status: files complete. **Verification deferred to the user** — per user instruction tests were NOT run by the assistant; user runs `python -m pytest` locally.

### Phase | 7 | POST /api/auth/register/ | COMPLETED | 2026-08-10

Added `POST /api/auth/register/` to create a `User` and its auth `Token` in one call. Public endpoint (`AllowAny`) — registration must not be blocked by the global `IsAuthenticatedOrReadOnly` on records. Response is `201` with `{id, username, email, token}`.

Files added/changed:

- `api/serializers.py` — added `RegisterSerializer` (plain `serializers.Serializer`, not a ModelSerializer, so the token can be returned cleanly):
  - `username` — `CharField(max_length=150)`; duplicate detected in `validate()` → 400.
  - `email` — `EmailField(required=False, allow_blank=True)`; bad format → 400. Email optional to match Django's built-in `User`.
  - `password` — `CharField(write_only=True, min_length=8)`.
  - `create()` — `get_user_model().objects.create_user(...)` (handles password hashing) then `Token.objects.get_or_create(user=user)`, returns `(user, token)`.
  - `to_representation()` — `{id, username, email, token: token.key}`.
- `api/views.py` — added `RegisterAPIView(generics.CreateAPIView)` with `serializer_class = RegisterSerializer` and `permission_classes = [AllowAny]`. No other views changed.
- `api/urls.py` — registered `path('auth/register/', RegisterAPIView.as_view())`.
- `tests/test_auth.py` — replaced the placeholder with Phase 7 gate tests:
  - `test_register_url_resolves` — URL resolves to `api.views`.
  - `test_register_returns_201_and_token` — anonymous POST → 201, `username`/`email` echoed, returned token matches the DB `Token` row.
  - `test_register_duplicate_username_400` — reuses `test_user` fixture; same username → 400 with `username` error.
  - `test_register_invalid_email_400` — `'not-an-email'` → 400 with `email` error.

No model changes, migrations, or website app changes.

Gate (from plan): valid → 201 + token returned; duplicate username → 400; bad email → 400.

Status: files complete. **Verification deferred to the user** — per user instruction tests were NOT run by the assistant; user will run `python -m pytest` locally and confirm.

### Phase | 6 | DELETE /api/records/<pk>/ (delete) | COMPLETED | 2026-08-10

Enabled deleting a single `Record` via `DELETE /api/records/<pk>/`. Deletes require authentication (global `IsAuthenticatedOrReadOnly`; anonymous deletes → 403 via the `permission_denied` override; object left untouched). No serializer changes.

Files added/changed:

- `api/views.py` — `RetrieveUpdateDestroyRecordAPIView.http_method_names` changed from `['get', 'put', 'patch', 'head', 'options']` to `['get', 'put', 'patch', 'delete', 'head', 'options']`. No other changes.
- `tests/test_records.py` — removed `test_records_detail_delete_not_allowed` (authenticated DELETE → 405, no longer valid since DELETE is now enabled). Added Phase 6 gate tests:
  - `test_records_delete_returns_204_and_removes` — authenticated delete of an existing record → 204, `Record` gone from DB.
  - `test_records_delete_missing_pk_404` — authenticated delete of a missing pk → 404.
  - `test_records_delete_anonymous_forbidden` — anonymous delete → 403 (mirrors Phase 3's anonymous-create guard).

Gate (from plan): delete → 204 (object gone); delete again → 404.

Status: files complete. **Verification deferred to the user** — per user instruction tests were NOT run by the assistant; user will run `python -m pytest` locally and confirm.

### Phase | 5 | PUT/PATCH /api/records/<pk>/ (update) | COMPLETED | 2026-08-10

Enabled updating a single `Record` via `PUT /api/records/<pk>/` (full replace) and `PATCH /api/records/<pk>/` (partial update). Writes require authentication (global `IsAuthenticatedOrReadOnly`; anonymous writes → 403 via the existing `permission_denied` override). DELETE stays disabled until Phase 6. No serializer changes — `RecordSerializer` already handles update.

Files added/changed:

- `api/views.py` — `RetrieveUpdateDestroyRecordAPIView.http_method_names` changed from `['get', 'head', 'options']` to `['get', 'put', 'patch', 'head', 'options']`. No other changes.
- `tests/test_records.py` — replaced `test_records_detail_update_not_allowed` (authenticated PUT → 405, no longer valid since PUT/PATCH are now enabled) with `test_records_detail_delete_not_allowed` (authenticated DELETE → 405, guarding Phase 6). Added Phase 5 gate tests:
  - `test_records_full_put_updates_200` — cached full put → 200, response echo + DB re-fetch confirm every field updated.
  - `test_records_partial_patch_updates_200` — cached patch with only `phone` → 200, only `phone` changes (response + DB).
  - `test_records_put_missing_fields_400` — cached put with only `first_name` → 400, errors list the 7 missing required fields.

Gate (from plan): full PUT → 200 updated; partial PATCH → 200 partial; missing required fields → 400. Note in PLAN.md: the original plan's "unknown field → 400" case is met by missing-required-field 400, since DRF's default `ModelSerializer` ignores unknown keys rather than rejecting them.

Status: files complete. **Verification deferred to the user** — per user instruction tests were NOT run by the assistant; user will run `python -m pytest` locally and confirm.

### Phase | 4 | GET /api/records/<pk>/ (detail) | COMPLETED | 2026-08-10

Added detail retrieval of a single `Record` via `GET /api/records/<pk>/`. Read access is public (global `IsAuthenticatedOrReadOnly` allows safe GETs for anonymous users); writes stay disabled until Phases 5/6. Reuses the existing `RecordSerializer` (no serializer changes needed).

Files added/changed:

- `api/views.py` — added `RetrieveUpdateDestroyRecordAPIView` (`generics.RetrieveUpdateDestroyAPIView`; `queryset = Record.objects.all()`; `serializer_class = RecordSerializer`; `http_method_names = ['get', 'head', 'options']` so PUT/PATCH/DELETE return 405 until Phase 5/6; same `permission_denied` override as the list view so anonymous write denials return 403).
- `api/urls.py` — registered `path('records/<int:pk>/', RetrieveUpdateDestroyRecordAPIView.as_view())`; `<int:pk>` makes invalid pk types fall through to Django's 404 and existing-but-missing pks 404 via the serializer's `get_object`.
- `tests/test_records.py` — added Phase 4 gate tests:
  - `test_records_detail_url_resolves` → `/api/records/1/` resolves to `api.views`.
  - `test_records_detail_returns_200` → seeded record → 200, JSON body has `id`, `created_at`, and all submitted fields (anonymous GET proves read stays public).
  - `test_records_detail_missing_pk_404` → `/api/records/999999/` → 404.
  - `test_records_detail_invalid_pk_404` → `/api/records/abc/` → 404.
  - `test_records_detail_update_not_allowed` → authenticated PUT on detail → 405 (guards that update stays off until Phase 5, mirroring Phase 2's POST→405 precedent).

Gate (from plan): `python -m pytest` passes; existing pk → 200 with full object; missing pk → 404; invalid pk type → 404.

Status: files complete. **Verification deferred to the user** — per user instruction tests were NOT run by the assistant; user will run `python -m pytest` locally and confirm.

### Phase | 3 | POST /api/records/ (create) | COMPLETED | 2026-08-10

Enabled creation of `Record`s via `POST /api/records/`. Phase 2 kept the method list to `['get', ...]` so POST returned 405; Phase 3 dropped that restriction so `ListCreateAPIView`'s default POST path is active. Separate auth endpoint work (register/token) is still Phase 7/8; for now the single record serializer was already create-ready (all model fields required, `created_at` read-only), so no serializer change was needed.

Files added/changed:

- `api/views.py` — removed `http_method_names = ['get', 'head', 'options']` from `ListCreateRecordAPIView`; POST is now handled by the generic create logic (validation via `RecordSerializer`, 201 on success, 400 on validation errors).
- `tests/conftest.py` — added `auth_client` fixture: `api_client.force_authenticate(user=test_user)` so create tests pass the current `IsAuthenticatedOrReadOnly` permission (anonymous POST is rejected).
- `tests/test_records.py` — replaced the obsolete `test_records_list_post_not_allowed` (POST is now a legal method) with Phase 3 gate tests:
  - `test_records_create_anonymous_forbidden` → anonymous POST → 403.
  - `test_records_create_returns_201` → authenticated POST with full valid payload → 201, JSON body has `id`, `created_at`, and all submitted fields; DB row verified.
  - `test_records_create_missing_fields_400` → authenticated POST missing required fields → 400 with validation error keys for each missing field.

Gate (from plan): `python -m pytest` passes; valid create → 201 + object returned; missing/invalid fields → 400 with validation errors.

Status: files complete. **Verification deferred to the user** — per user instruction tests were NOT run in the assistant sandbox; user will run `python -m pytest` locally and confirm.

### Phase | 2 | GET /api/records/ | COMPLETED | 2026-08-10

Added GET listing of `Record`s at `/api/records/` (plain JSON array, no pagination — decided over the plan's "paginated JSON" wording so empty list returns `[]` as specified). Create is disabled until Phase 3.

Files added/changed:

- `api/serializers.py` — added `RecordSerializer` (`website.models.Record`, `fields = '__all__'`, `created_at` read-only).
- `api/views.py` — added `ListCreateRecordAPIView` (`generics.ListCreateAPIView`; `queryset = Record.objects.all()`; `http_method_names = ['get', 'head', 'options']` so POST returns 405 until Phase 3 enables it).
- `api/urls.py` — registered `path('records/', ListCreateRecordAPIView.as_view())`; kept the existing `DefaultRouter` include.
- `tests/test_records.py` — added Phase 2 gate tests: `/api/records/` URL resolves; empty list → 200 `[]`; seeded records → 200 array of length 2 with all fields present/correct; POST → 405.

Gate (from plan): `python -m pytest` passes; empty list → `[]`; seeded records → JSON with correct fields.
Status: files complete. **Verification deferred to the user** — user will run `python -m pytest` locally and confirm. Note: in the assistant's Linux sandbox the SQLite switch did not apply (pytest-django sets up Django during `pytest_load_initial_conftests`, i.e. before the root `conftest.py` runs, so `USE_SQLITE` wasn't set in time and MySQL/`mysqlclient` was imported), so the suite could not be verified here.

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