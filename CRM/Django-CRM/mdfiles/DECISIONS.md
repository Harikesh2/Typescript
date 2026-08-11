# DECISIONS — Django CRM Next.js Frontend

> Every technical decision is logged here with rationale + date + status. Append; never delete. Follow D-XX numbering.

| ID | Date | Decision | Why | Status |
|----|------|----------|-----|--------|
| D-01 | 2026-08-11 | Next.js app inside repo as `/frontend` | One repo for the CRM; deploys together with backend; easy Docker/compose wiring | Active |
| D-02 | 2026-08-11 | Auth via Next.js BFF proxy + httpOnly cookie | Token never in browser JS, no CORS, DRF token auth is CSRF-exempt so the proxy is clean | Active |
| D-03 | 2026-08-11 | Keep legacy Bootstrap templates, mark deprecated | Avoid breaking existing users during migration; remove later | Active |
| D-04 | 2026-08-11 | Design: light + soft pastel gradients | User preference; modern, soft, data-friendly | Active |
| D-05 | 2026-08-11 | Dashboard v1 = stats cards only | User preference; charts deferred to v2 | Active |
| D-06 | 2026-08-11 | `/api/stats/` requires token auth | Aggregates are sensitive; it powers an authenticated dashboard | Active |
| D-07 | 2026-08-11 | Pagination opt-in via `?page=`, minimal impl | Keeps existing array-shape tests green; don't overinvest now | Active |
| D-08 | 2026-08-11 | `?state=` filter via a `get_queryset()` override (no `django-filter` dependency) | Exact match is one filter; avoids adding a third-party dependency for a single field | Active |
| D-09 | 2026-08-11 | Stats time windows: week = UTC week starting Monday; month = UTC calendar month | Simple, unambiguous semantics; consistent with `USE_TZ=True` / `TIME_ZONE=UTC` | Active |
| D-10 | 2026-08-11 | Design system: GitHub Primer (dark/night) via `@primer/react` + `@primer/primitives` + `styled-components` | Agent scaffolded Phase 1 with Primer before D-04 styling was built; Primer gives a complete, accessible component + token system out of the box | Active — supersedes D-04 |
