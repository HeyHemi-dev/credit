# Tech Stack

## Framework/UI
- **TanStack Start** (Vite)
- **TanStack Form** (+ other TanStack libs)
- **shadcn/ui**
- **Tailwind**

## Hosting
- **Vercel**

## Database
- **Neon** (Postgres)
- **Drizzle ORM** (queries, migrations)

## Validation
- **Zod**

## Authentication
- **Neon Auth** (Better Auth) + Google OAuth (web app)

## Email
- **Resend** (transactional)

## CI/CD
- **GitHub Actions**

## Testing
- **Vitest**

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
