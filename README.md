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

GitHub Actions now owns CI, PR Neon branch lifecycle, and production release
ordering.

### Workflows

| Workflow                    | Trigger                               | Purpose                                                                 |
| --------------------------- | ------------------------------------- | ----------------------------------------------------------------------- |
| `PR CI`                     | PR opened, reopened, synchronized     | Reset `pr-<number>` from prod, set preview `CR_DATABASE_URL`, run checks |
| `Cleanup PR DB`             | PR closed                             | Remove branch-specific preview env override and delete `pr-<number>`    |
| `Release Main`              | Push to `main`                        | Run checks, migrate prod, run integration tests, deploy to Vercel       |

### Required GitHub secrets

GitHub Actions now pulls runtime env from Vercel. Keep the stable app and Neon
configuration values in Vercel, and keep only the automation bootstrap secrets
in GitHub:

| Secret             | Purpose                                                        |
| ------------------ | -------------------------------------------------------------- |
| `NEON_API_KEY`     | Neon API token for PR branch create / restore / delete         |
| `VERCEL_ORG_ID`    | Vercel org/team id for env pulls, preview env updates, deploys |
| `VERCEL_PROJECT_ID`| Vercel project id for env pulls, preview env updates, deploys  |
| `VERCEL_TOKEN`     | Vercel token for `vercel pull/build/deploy` and env updates    |

### Vercel env recommendations

For this setup, Vercel should be the source of truth for:

- `AUTH_SECRET`
- `EMAIL_FROM`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `RESEND_API_KEY`
- `CR_NEON_PROJECT_ID`
- `NEON_PROD_BRANCH_ID`
- `CR_PGDATABASE`
- `CR_PGUSER`

These should usually be the same in both `preview` and `production`, because
they describe the same app, OAuth app, email sender, and Neon project.

The important exception is `CR_DATABASE_URL`:

- production keeps the stable prod DB value
- preview keeps the shared default preview value
- each PR gets a branch-specific preview override for `CR_DATABASE_URL`
  pointing at its own `pr-<number>` Neon branch

### Preview deployment note

GitHub Actions computes the PR database URL, writes it back to Vercel as a
branch-specific preview override for `CR_DATABASE_URL`, then pulls preview envs
from Vercel for that git branch. Deployed previews still read runtime env vars
from Vercel, not GitHub.

If Vercel starts a preview deployment before the `PR CI` workflow has updated
that branch-specific `CR_DATABASE_URL`, the first deployed preview may still be
pointing at the old preview DB value. Re-running the preview deployment after
the first successful `PR CI` run fixes that and subsequent PR updates reuse the
correct branch-specific override.

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
