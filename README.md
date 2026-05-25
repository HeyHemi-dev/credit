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
| `CR_NEON_PROJECT_ID`   | Neon project id for branch setup and branch maintenance scripts.              |
| `NEON_DEV_BRANCH_ID`   | Protected Neon development branch id for branch maintenance scripts.          |
| `NEON_PROD_BRANCH_ID`  | Protected Neon production branch id for branch maintenance scripts.           |
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

Codex worktree automated setup uses [.codex/environments/environment.toml](.codex/environments/environment.toml). For manual setup, pass the `WORKTREE_PATH` variable:

```bash
pnpm worktree:setup "$WORKTREE_PATH"
```

For manual cleanup:

```bash
pnpm worktree:cleanup "$WORKTREE_PATH"
```

## Database setup

| Script                                               | Description                                                                                                                  |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `pnpm db:migrate`                                    | Run migrations                                                                                                               |
| `pnpm db:probe [options]`                            | Verify DB connection ([scripts/db-probe.ts](scripts/db-probe.ts)); Optional `--write` arg; inserts and deletes a test event. |
| `pnpm db:list-branches`                              | List active Neon branches with branch name and id.                                                                           |
| `pnpm db:delete-branches <branch-id> [branch-id...]` | Delete explicit Neon branch ids; refuses default branches, protected branch names, `NEON_DEV_BRANCH_ID`, and `NEON_PROD_BRANCH_ID`. |

Other Drizzle maintenance scripts are available in [package.json](package.json).

## CI/CD

GitHub Actions now handles validation only, while Vercel owns migration, build,
and deploy.

### GitHub Actions

The CI workflow runs on pull requests and pushes to `main`, and runs:

- `pnpm lint`
- `pnpm type-check`
- `pnpm test`

No GitHub secrets are required for this workflow.

### Vercel

Vercel should own the actual deployment pipeline for both preview and
production, including schema application.

Recommended build command:

```bash
pnpm db:migrate && pnpm build
```

That keeps each Vercel deployment aligned with the database connection string
Vercel already provides for that environment.

## Testing

[Vitest](https://vitest.dev/):

```bash
pnpm test
```

The normal test script skips integration tests. To run all integration tests,
use:

```bash
pnpm test:integration
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
- [Directory/profile MVP](documentation/with-thanks_directory-profile-mvp.md) — public profile, directory, ownership, and rating decisions
- [Lean canvas](documentation/give-credit_lean-canvas.md)
