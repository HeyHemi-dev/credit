# Privacy facts (from codebase)

This document captures **privacy-relevant facts explicitly expressed in this repository** (schemas, routes, server functions, auth/session handling, client storage, logging, and named third parties). It is **not** a privacy policy draft.

## Data model (what’s stored)

### App-owned Postgres tables (Drizzle)

Source: `src/db/schema.ts`

- **`suppliers`**
  - **Fields**: `id`, `name`, **`email`**, `emailDomain` (generated from `email`), `instagramHandle`, `tiktokHandle`, `region`, `createdAt`, `updatedAt`
  - **Indexes/uniques**: unique (case-insensitive) email, email-domain index, indexes on social handles

- **`events`**
  - **Fields**: `id`, `createdByUserId` (FK → `neon_auth.user.id`), `eventName`, `weddingDate`, `region`, **`shareToken`**, `createdAt`, `updatedAt`
  - **Indexes/uniques**: unique share token, index on `createdByUserId`

- **`event_suppliers`** (junction table)
  - **Fields**: `eventId`, `supplierId`, `service`, `contributionNotes`, `createdAt`, `updatedAt`
  - **Keying**: composite primary key (`eventId`, `supplierId`)

### Neon Auth schema tables present in repo (reference)

Source: `src/db/schema.ts` (“Neon Auth schema - for reference only”)

These tables illustrate what exists in the auth system (and therefore what may be stored there):

- **`neon_auth.user`**: `id`, `name`, **`email`**, `emailVerified`, `image`, `createdAt`, `updatedAt`, plus fields like `role`, `banned`, `banReason`, `banExpires`
- **`neon_auth.session`**: `id`, `expiresAt`, **`token`**, `createdAt`, `updatedAt`, `userId`, optional `ipAddress`, optional `userAgent`, plus org/impersonation fields
- **`neon_auth.account`**: `providerId`, `accountId`, `userId`, optional `accessToken`, `refreshToken`, `idToken`, expiries, optional `password`, etc.
- Also: `verification`, `jwks`, `organization`, `member`, `invitation`, `project_config` (see `src/db/schema.ts`)

## Data entry points (what users can submit)

### Validation rules (API/form boundary)

Source: `src/lib/types/validation-schema.ts`

- **Event fields**
  - `eventName` (required string)
  - `weddingDate` (required `YYYY-MM-DD` string)
  - `region` (optional; empty string allowed in form schema, converted to `null` for API schema)

- **Supplier fields**
  - `name` (required string)
  - **`email`** (required email; normalized to lowercase)
  - `instagramHandle` / `tiktokHandle` (optional; must match `@handle` patterns in the form, then transformed for API by stripping leading `@`)
  - `region` (optional; empty string allowed in form schema, converted to `null` for API schema)

- **Credit fields (event → supplier link)**
  - `service` (required enum)
  - `supplierId` (required UUID)
  - `contributionNotes` (optional; max 255; empty string converted to `null`)

### Server functions (API surface)

Source: `src/lib/server/*.ts`

- **Events** (`src/lib/server/events.ts`)
  - `listEventsFn` (GET) — session-authenticated
  - `createEventFn` (POST) — session-authenticated; generates `shareToken`
  - `getEventFn` (GET) — session-authenticated
  - `getEventForCoupleFn` (GET) — accepts session OR share-token auth
  - `deleteEventFn` (POST) — session-authenticated

- **Suppliers** (`src/lib/server/suppliers.ts`)
  - `searchSuppliersFn` (GET) — **no auth check**
  - `dedupeSuppliersFn` (GET) — **no auth check**; logs `{ data, error }` on error (includes email + name)
  - `createSupplierFn` (POST) — requires `isValidAuthToken` (session OR share token)

- **Event credits** (`src/lib/server/event-credits.ts`)
  - `createCreditFn` (POST) — requires `isValidAuthToken` (session OR share token)
  - `deleteCreditFn` (POST) — requires `isValidAuthToken` (session OR share token)

## Auth and access model

### Auth token model

Source: `src/hooks/use-auth-token.ts`, `src/lib/types/validation-schema.ts`, `src/lib/server/auth.ts`

- **Session token mode** (photographer app): `authClient.useSession()` returns a token + `userId`, shaped into `{ status: authenticated, tokenType: sessionToken, token, authUserId }`.
- **Share token mode** (couple flow): share token comes from URL search params and is shaped into `{ status: authenticated, tokenType: shareToken, token }`.

### Routes that imply access boundaries

Sources:
- Couple view: `src/routes/(app)/_appLayout.e.$eventId.tsx`
- Photographer views: `src/routes/(app)/_appLayout.events.index.tsx`, `src/routes/(app)/_appLayout.events.$eventId.tsx`

Key behaviors expressed in code:

- **Share-link auth**: couple route requires `shareToken` in the URL: `/e/$eventId?shareToken=...` (`src/routes/(app)/_appLayout.e.$eventId.tsx`).
- **Session auth UI gating**: photographer routes render `<RedirectToSignIn />` if unauthenticated (`src/routes/(app)/_appLayout.events.index.tsx`, `src/routes/(app)/_appLayout.events.$eventId.tsx`).

### Exposure surfaces implied by code paths

- **Supplier emails are returned and displayed** in multiple flows:
  - `getEventFn` returns credits with `email` (photographer event view): `src/lib/server/events.ts`
  - `getEventForCoupleFn` returns credits with `email` (couple view): `src/lib/server/events.ts`
  - `searchSuppliersFn` returns suppliers with `email` and has no auth gate: `src/lib/server/suppliers.ts`
  - `dedupeSuppliersFn` returns candidate suppliers with `email` and has no auth gate: `src/lib/server/suppliers.ts`
  - Dedupe UI renders candidate emails: `src/components/suppliers/create-supplier-form.tsx`

- **Share token appears in URLs**:
  - Share link is generated and copied using `search: { shareToken: event.shareToken }`
    - `src/components/events/event-list.tsx`
    - `src/routes/(app)/_appLayout.events.$eventId.tsx`

## Client-side storage (as implemented)

- **`localStorage`**
  - `src/components/credit/intro-modal.tsx` stores key `credit.coupleIntroDismissed.v1 = "1"` to suppress the intro modal for the couple flow.

No other `localStorage` / `sessionStorage` usage was found via repo search at time of writing.

## Logging / telemetry (as implemented)

Sources: `src/lib/logger.ts`, `src/lib/server/suppliers.ts`, plus `console.*` usage in a few server files.

- `logger` behavior:
  - Logs on server always; logs on client only in development (`src/lib/logger.ts`).
- Potentially privacy-relevant logging:
  - `dedupeSuppliersFn` logs `{ data, error }` on error, where `data` contains `email` and `name` (`src/lib/server/suppliers.ts`).
- Other console logs exist:
  - `src/db/connection.ts` logs when connecting (“Attempting to connect…”)
  - `scripts/db-write-probe.ts` logs test output
  - `src/db/queries/auth.ts` contains `console.log({ any })` in currently unreachable code (see note below)

## Notes / code-level flags

- **Session validation stub**: `isValidSession()` currently returns `true` immediately (`src/db/queries/auth.ts`). Downstream server functions call `isValidSession(...)` in `src/lib/server/events.ts`. This affects the practical enforcement of “session-authenticated” checks as currently implemented.

## Named third parties referenced in repo

Sources: `package.json`, `.env.example`, `documentation/give-credit_tech-stack.md`, `src/routes/__root.tsx`, `README.md`

- **Neon**: Postgres + Auth client packages and env vars (`CR_DATABASE_URL`, `VITE_NEON_AUTH_URL`)
- **Google OAuth**: enabled as a social provider in `src/routes/__root.tsx`
- **Vercel**: referenced for environment management and hosting in `README.md`
- **Planned (documented, not implemented)**:
  - Transactional email: “Resend” listed as planned in `documentation/give-credit_tech-stack.md`

