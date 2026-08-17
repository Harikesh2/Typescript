# PLAN — AI Lead Scoring (Moonshot via AWS Lambda) for Django CRM

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

Score each CRM lead 1–10 with a one-sentence reason using the Moonshot LLM. A manual "Score Lead" button on the record detail page calls a Django endpoint that forwards the record to an AWS Lambda function; Lambda asks Moonshot and POSTs the score back to Django, which stores it and flips the record back to `IDLE`. The frontend polls until the score lands (60s timeout) and renders it with a color-coded badge. Editing a record invalidates the score and allows re-scoring.

## Repo analysis (findings)

- Backend: Django 4.1 + DRF; `website/models.Record` has **no** scoring fields and **no `updated_at`** — both must be added (D-37, D-36).
- No score endpoints exist yet — `PATCH /api/records/<pk>/score/` (Lambda callback), `POST /api/records/<pk>/score-trigger/`, and `POST /api/records/<pk>/reset-scoring/` are all new (the PRD claimed the callback "already exists" — it does not).
- `RecordSerializer` uses `fields = '__all__'`; score fields must be read-only so the client can never write them (D-38).
- Legacy cruft still present: `Django-CRM/mydb.py`, `website/templates/`, function-based views in `website/views.py`, and the `path('', include('website.urls'))` mount in `dcrm/urls.py` (D-35).
- Frontend `/records` already talks to the real API; the legacy mock-data path (`contacts-table.tsx`, `lib/contacts.ts`) was already removed in the Phase 6 PR-review round.
- The `website` app cannot be deleted — it hosts the `Record` model, `admin.py`, `checks.py`, and the healthcheck command.
- Tests run on in-memory SQLite (`USE_SQLITE=1`); must stay green (`python -m pytest`).
- BFF proxy (`/api/[...path]`) already forwards everything to Django with `Authorization: Token <cookie>`; new record endpoints flow through it unchanged.

## Decisions

See `DECISIONS.md` for full rationale (D-34 → D-45). Summary: feature kickoff (D-34); remove legacy website UI, superseding D-03 (D-35); `Record` model + migration changes now allowed for this feature (D-36); add `updated_at=auto_now` for the re-score check (D-37); score fields read-only, only the Lambda callback writes them (D-38); concurrency lock via `scoring_status=PROCESSING` → 409, no-changes → 400 (D-39); fire-and-forget trigger via `threading`, no task queue (D-40); callback gated by a shared `LAMBDA_SECRET` header (D-41); frontend polls 3s / 60s then `reset-scoring` retry (D-42); callback aligns `ai_scored_at = updated_at` so the 400 guard stays exact (D-43); callback validates `ai_score` 1–10 (D-44); `lambda_trigger.py` uses stdlib `urllib.request` and no-ops without `LAMBDA_FUNCTION_URL` (D-45).

## Phases

### Phase 0 — Repo cleanup — COMPLETED

- Delete `Django-CRM/mydb.py` (orphaned MySQL helper, obsolete after D-24).
- Delete `website/templates/` (all legacy Bootstrap templates).
- Delete function-based views in `website/views.py` + `website/forms.py` + `website/urls.py`.
- Strip the `path('', include('website.urls'))` mount from `dcrm/urls.py` — keep `/api/` and `/admin/` only.
- Update root `README.md` (drop the legacy UI section) and `mdfiles/README.md`.
- Verify `/records` still loads real data from Django.
- **Gate:** `python -m pytest` green; `npm run dev` + Django running → `/records` shows real DB data; `/` no longer serves the legacy UI.

### Phase 1 — DB migration + API fields — COMPLETED

- Extend `Record` (`website/models.py`):
  - `description = models.TextField(blank=True, null=True)`
  - `ai_score = models.IntegerField(null=True, blank=True)`
  - `ai_reason = models.CharField(max_length=255, null=True, blank=True)`
  - `ai_scored_at = models.DateTimeField(null=True, blank=True)`
  - `scoring_status = models.CharField(max_length=20, choices=[('IDLE', 'Idle'), ('PROCESSING', 'Processing')], default='IDLE')`
  - `updated_at = models.DateTimeField(auto_now=True)` (D-37)
- `python manage.py makemigrations` + `python manage.py migrate`.
- `RecordSerializer`: `description` read/write; `ai_score`, `ai_reason`, `ai_scored_at`, `scoring_status` read_only (D-38).
- Register endpoints in `api/urls.py` (new): `PATCH records/<pk>/score/` (callback), `POST records/<pk>/score-trigger/`, `POST records/<pk>/reset-scoring/` — stubs OK this phase.
- New tests (`tests/test_scoring.py`).
- **Gate:** migration applies; `description` visible in the API; `python -m pytest` green.

### Phase 2 — Trigger & reset endpoints — COMPLETED

- Env vars (`Django-CRM/.env.example`): `LAMBDA_FUNCTION_URL`, `LAMBDA_SECRET`, `DJANGO_BASE_URL`.
- New `api/lambda_trigger.py` — fire-and-forget `threading.Thread` that POSTs the record payload to the Lambda Function URL (D-40) via stdlib `urllib.request` (D-45); no-op with a warning when `LAMBDA_FUNCTION_URL` is unset (dev/test-safe).
- `POST score-trigger/` (`api/views.py`):
  - Fetch record; 404 if missing.
  - Concurrency: `scoring_status == 'PROCESSING'` → **409** "already processing" (D-39).
  - Timestamp: `ai_scored_at` set and `updated_at <= ai_scored_at` → **400** "No changes detected. Edit the lead to re-score." (guard kept exact by D-43's callback alignment).
  - Else set `scoring_status = 'PROCESSING'`, save, fire `trigger_lead_scoring` async → **202 Accepted**.
- `POST reset-scoring/`:
  - Fetch record; if `ai_score is None` and `scoring_status == 'PROCESSING'`, set `IDLE` + save → **200** (lets the frontend unstick the lock after timeout); otherwise idempotent **200**.
- `PATCH score/` (Lambda callback): `AllowAny` + `authentication_classes=[]`, verify `LAMBDA_SECRET` header (D-41); validate `ai_score` 1–10 (D-44); update `ai_score`, `ai_reason`, `ai_scored_at` (= `updated_at` via `QuerySet.update`, D-43); set `scoring_status = 'IDLE'`.
- **Gate:** `python -m pytest` green ✅ (81 passed, 2026-08-17, user); Postman: trigger → 202; second trigger → 409; trigger after score without edits → 400; reset → 200 clears PROCESSING — ⏳ pending (user).

### Phase 3 — AWS Lambda — NOT STARTED

- Lambda (Python 3.12, 256 MB, 30s timeout) with Function URL (auth NONE); shared `LAMBDA_SECRET` sent on the callback.
- `lambda_function.py` — receive the record payload, build the prompt including `description`, call Moonshot, parse `{score, reason}`, POST to `{DJANGO_BASE_URL}/api/records/<id>/score/` with the secret header.
- Env vars: `MOONSHOT_API_KEY`, `LAMBDA_SECRET`.
- Test with a test event (payload includes `description`).
- **Gate:** Lambda test returns a score and the callback lands in Django (local via ngrok or the deployed backend).

### Phase 4 — Frontend score display & trigger flow — NOT STARTED

- Extend `frontend/src/lib/types.ts` (`description`, `ai_score`, `ai_reason`, `ai_scored_at`, `scoring_status`, `updated_at`).
- `frontend/src/components/crm/record-detail.tsx`:
  - "Score Lead" button (disabled while polling / when PROCESSING); spinner + "Scoring…" while waiting.
  - POST `/api/records/<id>/score-trigger/`; 409 → "Scoring already in progress", 400 → "No changes — edit to re-score".
  - Poll `GET /api/records/<id>/` every 3s until `ai_score != null` or 60s (D-42).
  - Timeout → "Something went wrong" + Retry button → `POST /reset-scoring/` → re-enable Score.
- New `frontend/src/components/crm/lead-score-badge.tsx` — badge 1–3 red, 4–6 yellow, 7–10 green + reason.
- Button stays visible after scoring; the backend blocks if there are no changes.
- **Gate:** `npm run build` + `npm run lint` pass; manual e2e: create lead → score → poll → badge appears; edit description → score again → re-score; simultaneous clicks blocked (409).

### Phase 5 — Cleanup & docs — NOT STARTED

- Error-handling audit — all failures silent (record still saves; no UI crash).
- Update `Django-CRM/.env.example` with all new variables.
- README: add "AI Lead Scoring" section (ASCII architecture, stack, live demo link).
- Update FEATURES.md (scoring rows → ✅).
- **Gate:** fresh clone + README instructions let a developer set up the feature.

### Phase 6 — Deploy — NOT STARTED

- Deploy Django to Railway/Render; set all env vars in production (incl. `DJANGO_BASE_URL`).
- Lambda `DJANGO_BASE_URL` must point at the deployed Django so callbacks reach it.
- Test the full flow in production: create lead → score → badge appears.
- Add a live demo link to README.
- **Gate:** recruiter can open the live URL and see the feature work end-to-end.

## Out of scope / handled elsewhere

- Auto-scoring on record creation (manual trigger only), batch scoring, score history, charts, dark mode, RBAC.
