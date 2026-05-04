# With Thanks

> _Send one link. Get wedding supplier tags back — copy-ready and formatted for Instagram._

Mobile-first web app for the wedding industry. **Primary users:** wedding photographers. Couples contribute supplier details via a private link (no login). NZ-only.

See [Tech stack](documentation/give-credit_tech-stack.md) for framework, database, auth, and implementation notes.

## Getting started

**Prerequisites:** Node 24+, pnpm, Git CLI, Vercel CLI, Neon CLI.

- `git`: required for local worktree setup and temporary branch workflows
- `vercel`: used to pull project env into `.env.local`
- `neon`: required for Neon project, database, and auth workflows used by this repo

After linking the Vercel project if needed, run:

```bash
pnpm install
vercel env pull
pnpm db:migrate
pnpm db:probe
pnpm dev
```

Runs on [http://localhost:5173](http://localhost:5173).

## Environment

Local development reads from `.env.local`. `drizzle.config.ts` also loads `.env.local`, so the database scripts use the same file.

The Vercel CLI and Neon CLI are both required for normal repo setup and environment/database management.

**From Vercel (recommended):** Install the [Vercel CLI](https://vercel.com/docs/cli), link the project (`vercel link` if needed), then pull env into `.env.local`:

```bash
vercel env pull
```

**Manual:** Create `.env.local` and fill in the required values below. If you deploy outside Vercel, set the same server-side variables in your hosting environment.

**Required application variables:**

| Variable               | Purpose                                                                       |
| ---------------------- | ----------------------------------------------------------------------------- |
| `CR_DATABASE_URL`      | Neon Postgres (pooled) connection string. Used at runtime and by Drizzle CLI. |
| `AUTH_SECRET`          | Better Auth secret for signing/encryption.                                    |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID for Better Auth social sign-in.                        |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret for Better Auth social sign-in.                    |
| `TEST_USER_ID`         | User Id from DB for running tests against                                     |

## Worktree setup

After creating a git worktree, run the setup helper from the main repo:

```bash
git worktree add ../credit-new-flow -b new-flow
pnpm worktree:setup ../credit-new-flow
```

The helper copies `.env.local` into the worktree, creates a Neon branch from `NEON_DEV_BRANCH_ID`, and rewrites the worktree's `CR_DATABASE_URL` to use the new branch. It reads `CR_NEON_PROJECT_ID`, `NEON_DEV_BRANCH_ID`, and the role/database from the main repo's `.env.local`.

Useful options:

```bash
pnpm worktree:setup ../credit-new-flow --branch-name worktree/new-flow
pnpm worktree:setup ../credit-new-flow --dry-run
```

## Database setup

| Script                    | Description                                                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `pnpm db:migrate`         | Run migrations                                                                                                               |
| `pnpm db:probe [options]` | Verify DB connection ([scripts/db-probe.ts](scripts/db-probe.ts)); Optional `--write` arg; inserts and deletes a test event. |

Other Drizzle maintenance scripts are available in [package.json](package.json).

## Testing

[Vitest](https://vitest.dev/):

```bash
pnpm test
```

## Project layout

| Path             | Description                                       |
| ---------------- | ------------------------------------------------- |
| `src/routes/`    | App routes, pages, and route handlers.            |
| `src/lib/`       | Shared app logic, server utilities, and helpers.  |
| `src/db/`        | Drizzle schema, database connection, and queries. |
| `drizzle/`       | Drizzle migration files.                          |
| `scripts/`       | Setup and maintenance scripts.                    |
| `documentation/` | Longer-form product and technical docs.           |

## Further reading

- [Tech stack](documentation/give-credit_tech-stack.md) — framework, database, auth, implementation notes
- [Product promise](documentation/give-credit_promise.md)
- [Design brief](documentation/give-credit_design-brief.md) — UX and constraints
- [V1 specs](documentation/give-credit_v1-specs.md) — user flows and specs
- [Lean canvas](documentation/give-credit_lean-canvas.md)
