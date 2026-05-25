# Tech Stack

| Area | In use | Planned |
|------|--------|---------|
| **Framework/UI** | TanStack Start (Vite), TanStack Router, TanStack Query, TanStack Form, TanStack Pacer, shadcn/ui, Tailwind | — |
| **Database** | Neon Postgres, Drizzle ORM | — |
| **Validation** | Zod | — |
| **Authentication** | Better Auth (self-hosted in app) + Google OAuth; auth/session tables stored in Neon Postgres | — |
| **Hosting** | Vercel | — |
| **Testing** | Vitest | — |
| **Email** | Resend (transactional) | Lifecycle/marketing automation TBD |
| **CI/CD** | GitHub Actions (PR CI, PR-scoped Neon preview DBs, prod release sequencing) | — |

# Implementation Notes

## Sessions
Cookie-based DB-backed sessions (store/rotate/revoke in Postgres)

## Auth Runtime and Storage
Better Auth runs inside the app rather than as a managed auth service. Auth data still lives in Neon Postgres via the Better Auth Drizzle adapter and the `neon_auth` schema tables.

## Auth Enforcement
TanStack Start middleware for route protection + server-fn checks for anything sensitive

## DB Connections
Use Neon pooled connection string for runtime (serverless-safe)

## Drizzle Client Pattern
One client per serverless invocation (module-level) using pooled connection; not "new client per query"

## Migrations
Run via GitHub Actions for PR validation and on `main` before production deploy

## Two Auth Modes by Design

### Browser App
Cookie sessions

### Automations API (soon after v1)
API key auth for Zapier/Make/etc.
