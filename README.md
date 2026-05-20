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
| `EMAIL_FROM`           | Transactional email sender address, e.g. `noreply@mail.withthanks.nz`.        |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID for Better Auth social sign-in.                        |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret for Better Auth social sign-in.                    |
| `RESEND_API_KEY`       | Resend API key for transactional email delivery.                              |
| `TEST_USER_ID`         | User Id from DB for running tests against                                     |

Transactional email uses Resend. Before sending real mail, verify the sending
subdomain in Resend, including DKIM, SPF, and MX records. For the current
no-reply setup, `EMAIL_FROM` should be an email address only; the app adds the
`With Thanks` sender name in code.

## Worktree setup

Codex worktree environments can use the built-in `CODEX_WORKTREE_PATH` variable:

```bash
pnpm worktree:setup "$CODEX_WORKTREE_PATH"
```

The helper copies `.env.local` from `/Users/hemi/Dev/credit` into the worktree, creates a Neon branch named from the `.codex/worktrees/<name>` path segment, rewrites the worktree's `CR_DATABASE_URL` to use the new branch, and records `NEON_WORKTREE_BRANCH_ID` so cleanup can delete the branch later.

Cleanup deletes only the Neon branch recorded in the worktree `.env.local`:

```bash
pnpm worktree:cleanup "$CODEX_WORKTREE_PATH"
```

Suggested Codex setup script:

```bash
cd "$CODEX_WORKTREE_PATH"
pnpm install
pnpm worktree:setup "$CODEX_WORKTREE_PATH"
```

Suggested Codex cleanup script:

```bash
cd "$CODEX_WORKTREE_PATH"
pnpm worktree:cleanup "$CODEX_WORKTREE_PATH"
```

## Database setup

| Script                    | Description                                                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `pnpm db:migrate`         | Run migrations                                                                                                               |
| `pnpm db:probe [options]` | Verify DB connection ([scripts/db-probe.ts](scripts/db-probe.ts)); Optional `--write` arg; inserts and deletes a test event. |

## Email integration test

To verify the real Resend send path without sending to a human inbox, run the
integration test suite. The normal test script skips integration tests; this
script sets the shared integration mode, sends to Resend's `delivered@resend.dev`
test recipient, and asserts that Resend accepts the message:

```bash
pnpm test:integration
```

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
