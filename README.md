# With Thanks

> _Send one link. Get wedding supplier tags back — copy-ready and formatted for Instagram._

Mobile-first web app for the wedding industry. **Primary users:** wedding photographers. Couples contribute supplier details via a private link (no login). NZ-only.

See [Tech stack](documentation/give-credit_tech-stack.md) for framework, database, auth, and implementation notes.

## Getting started

**Prerequisites:** Node 18+, pnpm.

```bash
pnpm install
pnpm dev
```

Runs on [http://localhost:5173](http://localhost:5173).

## Environment

**From Vercel (recommended):** Install the [Vercel CLI](https://vercel.com/docs/cli), link the project (`vercel link` if needed), then pull env into `.env.local`:

```bash
vercel env pull .env.local
```

**Manual:** Create `.env.local` and fill in values.

**Required variables:**

| Variable             | Purpose                                                                       |
| -------------------- | ----------------------------------------------------------------------------- |
| `CR_DATABASE_URL`    | Neon Postgres (pooled) connection string. Used at runtime and by Drizzle CLI. |
| `VITE_NEON_AUTH_URL` | Neon Auth / Better Auth backend URL.                                          |

## Database

- **Schema:** `src/db/schema.ts`
- **Migrations:** `drizzle/`

| Script             | Description                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm db:generate` | Generate migrations                                                                                                                                           |
| `pnpm db:migrate`  | Run migrations                                                                                                                                                |
| `pnpm db:push`     | Push schema (dev)                                                                                                                                             |
| `pnpm db:pull`     | Pull from DB                                                                                                                                                  |
| `pnpm db:check`    | Check                                                                                                                                                         |
| `pnpm db:probe`    | DB connectivity probe ([scripts/db-write-probe.ts](scripts/db-write-probe.ts)); requires `CR_DATABASE_URL` and an existing Neon Auth user or `PROBE_USER_ID`. |

## Testing

[Vitest](https://vitest.dev/):

```bash
pnpm test
```

## Build and preview

```bash
pnpm build
pnpm serve
```

## Project layout

| Path              | Description                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/routes/`     | TanStack Router (file-based). `e.$eventId` = couple view (no auth); `events.$eventId` = event management (auth); `auth.$pathname`, `account.$pathname` = Neon Auth. |
| `src/lib/server/` | Server functions (`createServerFn`).                                                                                                                                |
| `src/hooks/`      | Data-fetching and query keys.                                                                                                                                       |
| `src/db/`         | Drizzle schema, connection, queries.                                                                                                                                |
| `documentation/`  | Product and tech docs.                                                                                                                                              |

See [.cursorrules](.cursorrules) for conventions (hooks, server functions, validation, forms, etc.).

## Documentation

- [Tech stack](documentation/give-credit_tech-stack.md) — framework, database, auth, implementation notes
- [Product promise](documentation/give-credit_promise.md)
- [Design brief](documentation/give-credit_design-brief.md) — UX and constraints
- [V1 specs](documentation/give-credit_v1-specs.md) — user flows and specs
- [Lean canvas](documentation/give-credit_lean-canvas.md)
