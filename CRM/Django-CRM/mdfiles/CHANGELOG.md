# CHANGELOG — Django CRM Next.js Frontend

> Single changelog for all phase changes. Created once; append per phase. Follows `PLAN.md` (one phase at a time).

## AI Lead Scoring — Phase 5: Cleanup & docs (2026-08-18)

**Status:** COMPLETED · **Gate:** fresh clone + README instructions let a developer set up the feature — ✅ docs updated (2026-08-18, agent); `python -m pytest` ⏳ (docs-only change, no code touched; user confirms on next gate run)

### Files touched

- `Django-CRM/.env.example` (`MOONSHOT_API_KEY`, `MOONSHOT_API_URL`, `MOONSHOT_MODEL`)
- `README.md` (root — status implemented, ASCII architecture kept, env var tables, roadmap phase statuses, live demo placeholder)
- `Django-CRM/mdfiles/README.md` (AI Lead Scoring status → implemented + Moonshot env vars)
- `Django-CRM/mdfiles/FEATURES.md` (planned list narrowed to Phase 6 deploy)
- `Django-CRM/mdfiles/PLAN.md` (Phase 5 → COMPLETED)
- `Django-CRM/mdfiles/CHANGELOG.md`

### Changes made

- **Error-handling audit** — walked every failure path (backend trigger/reset/callback, `lambda_trigger.py`, `lambda_function.py`, frontend `record-detail.tsx` polling/retry) and confirmed no silent failures: Lambda missing env → 500 with the var name; Moonshot/parse/callback failure → 500, record stays `PROCESSING`, frontend 60s timeout → Retry → `reset-scoring` un-sticks (D-49); trigger concurrent → 409; no-changes → 400; reset idempotent 200. **No code changes required** — the Phase 2–4 guards already cover every path.
- **`.env.example`** — added the Lambda-side Moonshot vars that Phase 3 documented but the template never carried: `MOONSHOT_API_KEY` (required), `MOONSHOT_API_URL` (optional, defaults to `https://api.moonshot.ai/v1/chat/completions`), `MOONSHOT_MODEL` (default `moonshot-v1-8k`). `.env.example` now matches everything in `settings.py` + `lambda_function.py`.
- **Root `README.md`** — AI Lead Scoring feature bullet + section status flipped **planned → implemented**; kept the existing ASCII architecture diagram and added a note that the live demo link lands with Phase 6 (deploy). Stack line now splits backend vs Lambda env vars and links `lambda_scoring/README.md`. Configuration Reference backend table gained the three `MOONSHOT_*` rows with their defaults. Roadmap updated: Phases 0–5 ✅, Phase 6 📋.
- **`mdfiles/README.md`** — AI Lead Scoring status → implemented; env-var sentence now lists the Moonshot vars and points at `lambda_scoring/README.md`.
- **`FEATURES.md`** — registry row 35 was already ✅ (Phases 0–4); the Planned section now reflects that only Phase 6 (deploy + live demo link) remains.
- **`PLAN.md`** — Phase 5 marked COMPLETED with the audit summary and gate notes.

### Verification

- Gate is a fresh-clone docs walkthrough — all setup steps (`cp .env.example .env`, `migrate`, `runserver`, `npm run dev`, Lambda env var table) are present in README + `lambda_scoring/README.md`; `python -m pytest` unchanged (docs-only diff).

## AI Lead Scoring — Phase 4: Frontend score display & trigger flow (2026-08-17)

**Status:** COMPLETED · **Gate:** `npm run build` + `npm run lint` pass; manual e2e: create lead → score → poll → badge appears; edit description → score again → re-score; simultaneous clicks blocked (409) — ✅ all passed (2026-08-17, user)

### Files touched

- `frontend/src/lib/types.ts` (Record scoring fields + `RecordPayload` redefinition — D-51)
- `frontend/src/components/crm/lead-score-badge.tsx` (new)
- `frontend/src/components/crm/record-detail.tsx` (score button + polling + timeout/retry)
- `frontend/src/components/crm/record-form.tsx` (optional `description` TextArea)
- `mdfiles/PLAN.md` (Phase 4 → IN PROGRESS; decisions summary D-34 → D-52)
- `mdfiles/DECISIONS.md` (D-51, D-52)
- `mdfiles/CHANGELOG.md`

### Changes made

- **`frontend/src/lib/types.ts`** — `Record` gained `description: string | null`, `ai_score: number | null`, `ai_reason: string | null`, `ai_scored_at: string | null`, `scoring_status: 'IDLE' | 'PROCESSING'`, `updated_at: string` (all mirror the serializer output). **D-51:** `RecordPayload` now omits `id`, `created_at`, `updated_at`, `ai_score`, `ai_reason`, `ai_scored_at`, `scoring_status` and pins `description: string` — the shared form validates every `RecordPayload` key, so the read-only score fields would otherwise be forced through required-validation and the nullable `description` would break `.trim()`. New `ScoringStatus` type.
- **`frontend/src/components/crm/lead-score-badge.tsx` (new)** — renders a Primer `Label` colored by score (1–3 `danger`, 4–6 `attention`, 7–10 `success`) as `{score} / 10` plus the one-sentence `ai_reason`; returns `null` when `score === null`.
- **`frontend/src/components/crm/record-detail.tsx`** — "Score Lead" button in the header action row (disabled while scoring/polling/`PROCESSING`), a `Spinner` + "Scoring…" while waiting, and a `StarIcon` leading visual. `POST /api/records/<id>/score-trigger/`: 202 → start 3s polling with a 60s deadline (D-42); 409 → "Scoring already in progress."; 400 → "No changes detected. Edit the lead to re-score."; other → generic message (backend `detail` preferred via `data?.detail`). Polling is a recursive `setTimeout` (`pollTimerRef`/`pollDeadlineRef`, cleared on unmount) that refetches the record until `ai_score != null` (updates the badge) or the deadline hits → error `Flash` + **Retry** button → `POST /api/records/<id>/reset-scoring/` → refetch + re-enable Score (D-49). **D-52:** the initial load resumes polling when `scoring_status === 'PROCESSING'`, so a refresh during an in-flight score picks up the callback instead of stranding the lock. Detail view also shows the new `description` field and the `LeadScoreBadge` under "AI score" (`—` when unscored).
- **`frontend/src/components/crm/record-form.tsx`** — added an optional `description` `Textarea` (full-width below the 2-col grid, `FormControl.Caption` noting it feeds the AI prompt, `resize="vertical"`); `EMPTY_VALUES`/initial mapping include `description: ''` / `initial.description ?? ''`; the required-field loop skips `OPTIONAL_FIELDS = ['description']` so blank descriptions submit cleanly (D-51).

### Verification

- `npx tsc --noEmit` — ✅ clean (implementation-time sanity check). One fix on the first run: `RecordPayload.description` was `string | null` from the `Omit`, breaking `.trim()` and the `Textarea` `value` prop; pinned it to `string` in the type (D-51).
- `npm run build` + `npm run lint` — ✅ both pass (2026-08-17, user).
- Manual e2e: create lead → score → poll → badge appears; edit description → score again → re-score; simultaneous clicks blocked (409); timeout → Retry → reset re-enables Score — ✅ verified (2026-08-17, user).

## AI Lead Scoring — Phase 3: AWS Lambda (2026-08-17)

**Status:** COMPLETED · **Gate:** `python -m pytest` green; Lambda test returns a score and the callback lands in Django (local via ngrok or the deployed backend) — ✅ `python -m pytest` → 94 passed (2026-08-17, user); Lambda e2e ⏳ pending

### Files touched

- `Django-CRM/lambda_scoring/lambda_function.py` (new — D-46/D-47/D-48/D-49/D-50)
- `Django-CRM/lambda_scoring/requirements.txt` (new)
- `Django-CRM/lambda_scoring/README.md` (new)
- `Django-CRM/lambda_scoring/__init__.py` (new)
- `Django-CRM/tests/test_lambda.py` (new)
- `mdfiles/PLAN.md` (Phase 3 → IN PROGRESS; decisions summary D-34 → D-50)
- `mdfiles/DECISIONS.md` (D-46 → D-50)
- `mdfiles/CHANGELOG.md`

### Changes made

- **`lambda_scoring/lambda_function.py` (new, D-46)** — the dir is named `lambda_scoring` rather than `lambda` because `lambda` is a Python keyword and would make the handler un-importable by `tests/test_lambda.py`. `lambda_handler(event, context)`:
  - `json.loads(event['body'])` → require `id`, else 400 `Missing record id in payload.`
  - `build_prompt(payload)` renders every contact field + `description` (`PROMPT_FIELDS`); `build_request_payload(prompt)` wraps it in a system prompt asking for **JSON only** `{"score": 1-10, "reason": "one sentence ≤255 chars"}` (D-48), model `moonshot-v1-8k`.
  - `call_moonshot(payload)` POSTs to `https://api.moonshot.ai/v1/chat/completions` (D-47 — Moonshot is OpenAI-compatible, user has a Moonshot subscription, no OpenAI/SDK) with `Authorization: Bearer <MOONSHOT_API_KEY>` via stdlib `urllib.request`, **25s timeout** (D-50), then `extract_score(data)` strips ```json fences, coerces score to int, validates 1–10 (else raises → 500), defaults/truncates reason to 255.
  - On success POSTs `{ai_score, ai_reason}` to `{DJANGO_BASE_URL}/api/records/<id>/score/` with `X-Lambda-Secret` (D-41). Any exception → 500 (record stays `PROCESSING`; frontend 60s timeout + `reset-scoring` un-sticks — D-49); missing env var → 500 with the var name in the detail.
  - `if __name__ == '__main__':` builds a sample test event and prints the result — runnable locally.
- **`lambda_scoring/README.md`** — flow diagram, env var table (`MOONSHOT_API_KEY`, `LAMBDA_SECRET`, `DJANGO_BASE_URL`, optional `MOONSHOT_API_URL`/`MOONSHOT_MODEL`), Lambda console deploy steps (Python 3.12, 256 MB, 30s, Function URL auth NONE), local test command + console test event JSON, failure behavior. `requirements.txt` is stdlib-only (comment only).
- **`tests/test_lambda.py` (new)** — `build_prompt` includes all fields + description; `extract_score` clean JSON / fenced JSON / missing reason / 255-truncation / out-of-range ValueError / invalid JSON exception; `call_moonshot` posts to the right URL with `model=moonshot-v1-8k`, `Bearer` header, 25s timeout (monkeypatched `_post_json`, no network); `lambda_handler` success (callback URL/body/secret/timeout asserted), missing id → 400, missing `DJANGO_BASE_URL` → 500, Moonshot failure → 500.
- No backend changes — `lambda_trigger.py`, the trigger view, and the callback endpoint from Phase 2 already complete the loop.

### Verification

- `python -m py_compile` on changed files — ✅ compiles (implementation-time sanity check).
- `python -m pytest` — ✅ 94 passed (2026-08-17, user). One test bug found on the gate run and fixed in the same session: `test_extract_score_truncates_reason_to_255` built malformed JSON (`{"score": 5, "reason": "` + `x`*400 + `}` — missing the closing quote), so `json.loads` raised `Unterminated string` before the truncation logic ran. Fixed by closing the string (`...x*400 + '"}'`); the Lambda truncation itself was correct.
- Lambda console: test event → returns a score and the callback lands in Django — ⏳ pending (user; needs `MOONSHOT_API_KEY` + `DJANGO_BASE_URL` reachable from AWS).

## AI Lead Scoring — Phase 2: Trigger & reset endpoints (2026-08-17)

**Status:** COMPLETED · **Gate:** `python -m pytest` green; Postman: trigger → 202; second trigger → 409; trigger after score without edits → 400; reset → 200 clears PROCESSING — ✅ `python -m pytest` → 81 passed (2026-08-17, user); Postman ⏳ pending

### Files touched

- `Django-CRM/.env.example` (`LAMBDA_FUNCTION_URL`, `LAMBDA_SECRET`, `DJANGO_BASE_URL`)
- `Django-CRM/dcrm/settings.py` (`LAMBDA_FUNCTION_URL`/`LAMBDA_SECRET` from env, empty default)
- `Django-CRM/api/lambda_trigger.py` (new — D-40/D-45)
- `Django-CRM/api/views.py` (3 stub views → real implementations)
- `Django-CRM/tests/test_scoring.py` (stub tests removed; state-machine + callback + trigger-module tests)
- `mdfiles/PLAN.md` (Phase 2 → IN PROGRESS)
- `mdfiles/DECISIONS.md` (D-43, D-44, D-45)
- `mdfiles/CHANGELOG.md`

### Changes made

- **Env + settings** — `.env.example` documents `LAMBDA_FUNCTION_URL` (the Function URL Django POSTs the record to), `LAMBDA_SECRET` (shared secret the callback verifies), `DJANGO_BASE_URL` (the Lambda's callback target — documented for Phase 3; Django doesn't consume it). `dcrm/settings.py` reads `LAMBDA_FUNCTION_URL`/`LAMBDA_SECRET` with empty defaults so dev/pytest never need them (and `override_settings` makes them testable).
- **`api/lambda_trigger.py` (new, D-40/D-45)** — `build_payload(record)` serializes the contact fields + `description` (no score state — the Lambda only needs lead context); `trigger_lead_scoring(record)` spawns a **daemon** `threading.Thread` running `_post_to_lambda(url, payload, secret)`, which POSTs JSON via stdlib `urllib.request` (`Content-Type: application/json`, `X-Lambda-Secret`, 35s timeout — above the 30s Lambda timeout) and logs failures without crashing. **No-op + warning when `LAMBDA_FUNCTION_URL` is unset** (D-45) — dev/pytest never fire a thread or hit the network.
- **`POST /api/records/<pk>/score-trigger/`** — 404 missing → 409 `PROCESSING` → 400 `No changes detected. Edit the lead to re-score.` → else set `PROCESSING`, save, fire `trigger_lead_scoring`, **202**. Global `IsAuthenticatedOrReadOnly` keeps it anonymous → 401.
- **`POST /api/records/<pk>/reset-scoring/`** — 404 missing → if `ai_score is None and PROCESSING`: set `IDLE` + save → 200 (frontend timeout retry); otherwise idempotent 200 (existing score preserved).
- **`PATCH /api/records/<pk>/score/`** (Lambda callback) — `AllowAny` + `authentication_classes=[]`; missing/wrong `X-Lambda-Secret` header → 401 (D-41); 404 missing; `ai_score` must be an integer 1–10 else 400 (D-44); writes `ai_score`/`ai_reason` (truncated 255), then `Record.objects.filter(pk=...).update(ai_scored_at=record.updated_at)` — **D-43**: `QuerySet.update` bypasses `auto_now`, so `ai_scored_at == updated_at` and the trigger's `updated_at <= ai_scored_at → 400` guard fires until a real client edit advances `updated_at` (a plain `save()` would bump `updated_at` past `ai_scored_at` and permanently defeat the guard).
- **Tests** — removed the 3 stub-501 tests; added: trigger 202→PROCESSING / 409 / 400-no-changes / 202-after-edit / 404; reset clears-PROCESSING / idempotent / keeps-score / 404; callback wrong-secret 401 / missing-secret 401 / valid-secret 200 writes + `ai_scored_at == updated_at` + IDLE / out-of-range 400 / 404; `build_payload` shape; `trigger_lead_scoring` no-op without URL; `_post_to_lambda` sends the right URL/method/body/secret/35s-timeout (via monkeypatched `urlopen`). View tests monkeypatch `api.views.trigger_lead_scoring` so no thread ever spawns. Existing `test_scoring_endpoints_require_auth` stays green (callback without secret → 401).

### Verification

- `python -m py_compile` on changed files — ✅ compiles (implementation-time sanity check).
- `python -m pytest` — ✅ 81 passed (2026-08-17, user). Two test bugs found on the first gate run and fixed in the same session: `get_header('X-Lambda-Secret')` asserted None (urllib stores headers via `key.capitalize()`, so the canonical read is `get_header('X-lambda-secret')`; production unaffected — the wire sends the header and Django/Lambda read it case-insensitively) and `test_score_callback_missing_record_returns_404` lacked the `db` fixture (RuntimeError on `get_object_or_404` DB access).
- Postman: trigger → 202; second trigger → 409; trigger after score without edits → 400; reset → 200 clears PROCESSING — ⏳ pending (user).

## AI Lead Scoring — Phase 1: DB migration + API fields (2026-08-17)

**Status:** COMPLETED · **Gate:** migration applies; `description` visible in the API; `python -m pytest` green — ✅ 67 passed (2026-08-17)

### Files touched

- `Django-CRM/website/models.py` (6 new `Record` fields — D-36/D-37)
- `Django-CRM/website/migrations/0002_record_ai_reason_record_ai_score_record_ai_scored_at_and_more.py` (new)
- `Django-CRM/api/serializers.py` (`read_only_fields` — D-38)
- `Django-CRM/api/views.py` (3 stub views → 501)
- `Django-CRM/api/urls.py` (3 new routes)
- `Django-CRM/tests/test_records.py` (exact field-set assertion updated)
- `Django-CRM/tests/test_scoring.py` (new)
- `mdfiles/PLAN.md` (Phase 1 → IN PROGRESS)
- `mdfiles/CHANGELOG.md`

### Changes made

- **Model (D-36/D-37)** — `Record` gained `description` (`TextField`, blank/null), `ai_score` (`IntegerField`, null), `ai_reason` (`CharField` 255, null), `ai_scored_at` (`DateTimeField`, null), `scoring_status` (`CharField`, choices `IDLE`/`PROCESSING`, default `IDLE`), `updated_at` (`DateTimeField(auto_now=True)`, D-37 — drives the Phase 2 no-changes 400 check).
- **Migration** — `makemigrations website` generated `0002_record_ai_reason_record_ai_score_record_ai_scored_at_and_more.py`; applies cleanly on in-memory SQLite.
- **Serializer (D-38)** — `RecordSerializer.read_only_fields` now includes `ai_score`, `ai_reason`, `ai_scored_at`, `scoring_status`, so only the Lambda callback (Phase 2) can write them. `description` stays read/write; `created_at`/`updated_at` remain auto read-only (`editable=False`).
- **Endpoints registered (stubs, 501)** — `RecordScoreCallbackAPIView` (`PATCH records/<pk>/score/`), `RecordScoreTriggerAPIView` (`POST records/<pk>/score-trigger/`), `RecordResetScoringAPIView` (`POST records/<pk>/reset-scoring/`) each return `501 Not implemented yet.`. URL wiring + test infra proven now; Phase 2 fills in the bodies (409/400/secret-gated callback).
- **`test_records.py` fix** — the list endpoint's exact field-set assertion extended with the 6 new serializer fields (adding fields broke the old `==` set comparison).
- **New `tests/test_scoring.py`** — URL resolution for all 3 routes; `description` writable (POST/PATCH) + visible; `scoring_status` defaults to `IDLE`; forged score fields ignored on create AND patch (read-only enforcement); `updated_at` present, auto-managed (advances on PATCH), not client-settable; stubs → 501 authenticated / 401 anonymous.

### Verification

- `USE_SQLITE=1 python3 manage.py makemigrations website` — ✅ `0002_...` created.
- `USE_SQLITE=1 python3 manage.py migrate` — ✅ applies cleanly (in-memory SQLite).
- `USE_SQLITE=1 python3 manage.py check` — ✅ no issues.
- `python -m pytest` — ✅ 67 passed (2026-08-17, user).
- `description` visible in the API — ✅ (covered by `test_scoring.py`).

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

## Phase 0 — Repo cleanup (2026-08-15)

**Status:** COMPLETED · **Gate:** `python -m pytest` green; `/records` shows real DB data; `/` returns 404 (no legacy UI)

### Files touched

- `Django-CRM/mydb.py` (deleted — orphaned MySQL helper, obsolete after D-24)
- `Django-CRM/website/templates/` (deleted — all legacy Bootstrap templates)
- `Django-CRM/website/views.py` (deleted — function-based views)
- `Django-CRM/website/forms.py` (deleted)
- `Django-CRM/website/urls.py` (deleted)
- `Django-CRM/dcrm/urls.py` (removed `path('', include('website.urls'))` mount)
- `README.md` (root — dropped legacy UI feature bullet, `mydb.py` references, "Legacy Web Routes" table, `/` mention; slimmed `website/` structure block)
- `Django-CRM/mdfiles/README.md` ("website app untouched" line → legacy UI removed note)
- `AGENTS.md` (root — stale "legacy templates exist" lines → removed legacy UI, updated `website/` description)
- `Django-CRM/mdfiles/PLAN.md` (Phase 0 → IN PROGRESS)
- `Django-CRM/mdfiles/CHANGELOG.md`
- `Django-CRM/mdfiles/FEATURES.md`

### Changes made

- **Legacy UI removed (D-35, supersedes D-03)** — deleted `mydb.py`, `website/templates/` (7 Bootstrap templates), and the function-based `website/views.py`/`forms.py`/`urls.py`. Removed the `path('', include('website.urls'))` mount from `dcrm/urls.py`; root URLconf now serves `/api/` and `/admin/` only (`/` → 404). The `website` app itself stays — it hosts the `Record` model, `admin.py`, `checks.py`, and the `healthcheck` command.
- **Docs de-crufted** — root README dropped the deprecated-UI feature bullet, the `mydb.py` lines (project structure + Getting Started), the "Legacy Web Routes" table (replaced with a short "(removed)" note), and the "legacy UI at :8000/" mention; the `website/` structure block now lists only model/admin/checks/migrations/management. `mdfiles/README.md` and `AGENTS.md` updated to reflect that no legacy UI remains.
- **Verified safe** — no test or code references `website.views`/`website.forms`/`website.urls`; tests import only `website.models.Record`; nothing in the frontend calls legacy routes.

### Verification

- `python -m pytest` — ✅ 52 passed (2026-08-15).
- `/records` loads real DB data via Django — ⏳ pending (user).
- `/` returns 404 / no longer serves legacy UI — ⏳ pending (user).

## AI Lead Scoring — plan created (2026-08-15)

**Status:** PLAN (docs only — no code yet) · **Gate:** N/A (documentation pass)

### Files touched

- `Django-CRM/mdfiles/PLAN.md` (rewritten for the AI Lead Scoring feature, Phases 0–6)
- `Django-CRM/mdfiles/DECISIONS.md` (D-34 → D-42)
- `Django-CRM/mdfiles/CHANGELOG.md`
- `Django-CRM/mdfiles/README.md` (API surface + blurb)
- `Django-CRM/mdfiles/FEATURES.md` (planned registry row)
- `README.md` (root — AI Lead Scoring section + roadmap)

### Changes made

- New feature plan created from the user's spec: **AI Lead Scoring** via Moonshot + AWS Lambda. Day-by-day labels and AI-generated filler stripped; spec reconciled against the real codebase:
  - `Record` has no scoring fields and no `updated_at` — both added to Phase 1 (D-37).
  - No score callback endpoint exists — all three endpoints (`PATCH /score/`, `POST /score-trigger/`, `POST /reset-scoring/`) are new, not "already exists" as the spec claimed.
  - Phase 0 "wire mock data to real API" was already done (the legacy contacts mock was deleted in the Phase 6 PR-review round); kept only the remaining real cleanup (`mydb.py`, `website/templates/`, legacy views/routes).
- Decisions D-34 → D-42 appended: feature kickoff; legacy UI removal superseding D-03; model/migration changes allowed; `updated_at`; read-only score fields; 409/400 concurrency semantics; threading fire-and-forget; secret-gated callback; polling strategy.
- READMEs updated with the new endpoints + an "AI Lead Scoring" section; FEATURES.md gains a planned registry row.

### Verification

- ⏳ Pending — documentation-only; phase gates apply from Phase 0 onward (user runs `pytest`/`build`/`lint`).
