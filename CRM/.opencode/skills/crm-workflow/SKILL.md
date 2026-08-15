---
name: crm-workflow
description: Enforce the Django CRM monorepo phase workflow (PLAN.md → one phase at a time → log CHANGELOG.md → update FEATURES.md → run phase gate). Use when working on a phase, or when the user mentions "phase", "plan", "changelog", "feature registry", "FEATURES.md", "PLAN.md", "DECISIONS.md", or "gate".
---

# CRM phase workflow

The Django CRM monorepo (`Django-CRM/` backend + `frontend/` Next.js app) follows a strict, phase-based workflow. Always follow these steps when doing work on this project.

## Rules

1. **`mdfiles/PLAN.md` is the single source of truth** for the plan and phase status. Read it first and keep its phase statuses accurate.
2. **One phase at a time.** Never work across phases in one pass. Status: `NOT STARTED` → `IN PROGRESS` → `COMPLETED`.
3. **Log every technical decision** in `mdfiles/DECISIONS.md` (rationale, date, status, D-XX numbering). Append, never delete.
4. **Log ALL changes in the single `mdfiles/CHANGELOG.md`** — append a section per phase with files touched, changes made, and verification. Never create per-phase `.md` files.
5. **Update `mdfiles/FEATURES.md`** feature registry (status 📋 → 🚧 → ✅) and its "Implemented features" detail on completion.
6. **Do NOT run the phase gate yourself** — the user runs `python -m pytest` (backend) and `npm run build` / `npm run lint` (frontend) manually in a separate debugging session. Implement, mark verification as pending in CHANGELOG.md, and report.
7. **No scope creep.** Anything new = new decision + new phase.

## Workflow per task

1. Read `mdfiles/PLAN.md` to identify the current phase and its gate.
2. Confirm which phase the user wants worked on (if ambiguous, ask).
3. Mark the phase `IN PROGRESS` in PLAN.md.
4. Implement the change, following repo conventions (BFF proxy auth, Primer design, opt-in pagination, no model/migration changes).
5. Note the gate command(s) to run, but do NOT run them yourself — the user runs them manually in a separate debugging session.
6. Append the phase section to `CHANGELOG.md` (verification marked as pending).
7. Update `FEATURES.md` (registry row + implemented detail).
8. Add any new decisions to `DECISIONS.md` with a new D-XX number.
9. Keep the phase `IN PROGRESS` until the user confirms the gate passes; then mark `COMPLETED` in PLAN.md and report.

## Conventions to respect (do not re-read files for these)

- Auth is BFF-proxy only: browser never holds the DRF token; Next route handlers store it in the `dcrm_token` httpOnly cookie and inject `Authorization: Token <key>` on proxied calls. No CORS.
- Route protection uses `src/proxy.ts` exporting `proxy` (Next 16.3, D-18), NOT `middleware.ts`.
- Design system is GitHub Primer (D-10); Primer-using page components are `'use client'`.
- Reports/stats endpoints are token-gated, pure aggregates, no charts (D-05).
- Tests run on in-memory SQLite (`USE_SQLITE=1`), never MySQL.
