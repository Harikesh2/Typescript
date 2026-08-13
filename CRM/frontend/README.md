# Frontend — Next.js CRM Client

The frontend for the Django CRM monorepo. A [Next.js](https://nextjs.org) (App Router) + TypeScript application styled with GitHub Primer, talking to the Django REST Framework API through a BFF proxy.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **GitHub Primer** (`@primer/react` + `@primer/primitives`) with a `styled-components` SSR registry
- **BFF proxy auth** — the browser never touches the DRF token; the Next.js proxy stores it in an httpOnly cookie and injects `Authorization: Token <key>` on proxied API calls (see `DECISIONS.md` D-02)

## Routes

| Route | Description |
|---|---|
| `/` | Redirects to `/login` |
| `/login` | Log in with username + password |
| `/register` | Create an account (auto-login on success) |
| `/dashboard` | KPI stat cards + contacts table (mock data until Phase 3) |
| `/records` | Records list (stub until Phase 4) |
| `/records/new` | Add-record form (stub until Phase 4) |

Route protection lives in `src/proxy.ts` (Next 16 `proxy` convention, not `middleware.ts`): unauthenticated users visiting `/dashboard` or `/records` are redirected to `/login`; authenticated users visiting `/login` or `/register` are redirected to `/dashboard`.

## Auth flow

- `src/app/api/auth/login|register|logout/route.ts` — BFF handlers; register auto-logs in by reusing the token from the register response (D-16); logout clears the cookie client-side (D-15).
- `src/app/api/[...path]/route.ts` — catch-all proxy that forwards requests to `DJANGO_API_URL` with the cookie token attached.
- Cookie: `dcrm_token`, httpOnly, `sameSite=lax`, secure in production.

## Environment

| Variable | Description | Default |
|---|---|---|
| `DJANGO_API_URL` | Backend base URL used by the BFF proxy | `http://localhost:8000` |

Set via `next.config.ts` (env) or `.env`.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The Django backend must be running on `DJANGO_API_URL` for auth and data to work.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (prerenders all routes) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Project layout

```
src/
├── app/
│   ├── login/                 # Login page
│   ├── register/              # Register page
│   ├── dashboard/             # Dashboard page
│   ├── records/               # Records list + new-record stub
│   ├── api/auth/              # BFF handlers: login / register / logout
│   ├── api/[...path]/         # Catch-all proxy to the Django API
│   ├── page.tsx               # Root redirect
│   └── layout.tsx             # Root layout + providers
├── components/
│   ├── crm/                   # App sidebar, top bar, stat cards, contacts table, stub page, auth shell
│   ├── providers.tsx          # Primer / styled-components providers
│   └── styled-components-registry.tsx
├── lib/
│   ├── auth.ts                # BFF auth helpers (cookie handling)
│   └── contacts.ts            # Mock contact data (Phase 1)
└── proxy.ts                   # Route protection
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Primer React](https://primer.style/react) — component & design-system docs
