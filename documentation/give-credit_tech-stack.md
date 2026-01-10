Tech stack

Framework/UI: TanStack Start (Vite), TanStack Form (+ other TanStack libs), shadcn/ui

Hosting: Vercel

DB: Neon (Postgres)

DB access: Drizzle ORM + Drizzle migrations

Auth (web app): Neon Auth (Better Auth) + Google OAuth

Email: Resend (transactional)

CI/CD: GitHub Actions

Testing: Vitest

Implementation notes

Sessions: cookie-based DB-backed sessions (store/rotate/revoke in Postgres)

Auth enforcement: TanStack Start middleware for route protection + server-fn checks for anything sensitive

DB connections: use Neon pooled connection string for runtime (serverless-safe)

Drizzle client pattern: one client per serverless invocation (module-level) using pooled connection; not “new client per query”

Migrations: run via GitHub Actions on main only

Two auth modes by design

Browser app: cookie sessions

Automations API (soon after v1): API key auth for Zapier/Make/etc.