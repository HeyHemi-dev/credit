# Tech Stack

| Area | In use | Planned |
|------|--------|---------|
| **Framework/UI** | TanStack Start (Vite), TanStack Router, TanStack Query, TanStack Form, TanStack Pacer, shadcn/ui, Tailwind | — |
| **Database** | Neon (Postgres), Drizzle ORM | — |
| **Validation** | Zod | — |
| **Authentication** | Neon Auth (Better Auth) + Google OAuth | — |
| **Hosting** | Vercel | — |
| **Testing** | Vitest | — |
| **Email** | — | Resend (transactional, not yet integrated) |
| **CI/CD** | — | GitHub Actions (e.g. migrations on `main`, not yet configured) |

# Implementation Notes

## Sessions
Cookie-based DB-backed sessions (store/rotate/revoke in Postgres)

## Auth Enforcement
TanStack Start middleware for route protection + server-fn checks for anything sensitive

## DB Connections
Use Neon pooled connection string for runtime (serverless-safe)

## Drizzle Client Pattern
One client per serverless invocation (module-level) using pooled connection; not "new client per query"

## Migrations
Run via GitHub Actions on `main` only

## Two Auth Modes by Design

### Browser App
Cookie sessions

### Automations API (soon after v1)
API key auth for Zapier/Make/etc.
