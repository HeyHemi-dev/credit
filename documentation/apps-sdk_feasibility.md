# OpenAI Apps SDK feasibility for With Thanks

## Short answer

Yes — OpenAI Apps SDK can support photographers creating events from chat, and your recent move to in-app Better Auth makes this _more_ feasible (you now control auth/session behavior directly).

The key point: ChatGPT tool calls are server-to-server, so your website session cookie is not enough by itself. You need an OAuth-style delegated token flow for ChatGPT to call With Thanks APIs on behalf of a photographer.

## What this means for With Thanks

A practical target interaction is:

> “Create an event for Alex + Sam on 12 Feb 2027 in Auckland.”

ChatGPT should:

1. detect missing account connection and prompt user to connect With Thanks account,
2. receive an access token for With Thanks scopes,
3. call `create_event`,
4. return event confirmation + share link.

## Current repo state (auth and event creation)

These existing pieces are strong building blocks:

- In-app Better Auth server and handler under `/api/auth/*`.
- Browser session endpoint at `/api/session`.
- Server-side event creation path (`createEventFn` -> `createEvent` DB query).
- Validation schema for create event payload.

Important gap before production ChatGPT tools:

- `isValidSession()` currently logs Better Auth context but still accepts any non-empty token (`return sessionToken.length > 0`). This must be hardened.

## Recommended auth architecture for ChatGPT Apps

### Why cookie sessions are insufficient

Your existing web app authentication uses cookies, which works for browser requests. ChatGPT tool invocations are not made from the photographer's browser tab, so those cookies are unavailable during tool execution.

### Recommended model: delegated OAuth access tokens

Implement ChatGPT app auth as delegated OAuth (authorization code + PKCE), where:

- With Thanks is the authorization server/resource server for its API scopes.
- ChatGPT obtains and stores user-granted access/refresh tokens.
- Tool calls include bearer tokens scoped to operations like `events:create`.

This is the cleanest long-term model because it gives:

- explicit user consent,
- revocation and expiry,
- least-privilege scopes,
- auditable machine-to-machine calls.

### Should With Thanks become an OAuth provider?

In practice, yes for the ChatGPT integration surface.

That does **not** mean replacing Google sign-in for your website. Keep Google via Better Auth for interactive login; add an OAuth authorization layer for third-party client access (ChatGPT app) using your existing user/session identity backbone.

## Concrete token strategy options

### Option A (recommended): First-party OAuth server for ChatGPT

Build OAuth endpoints in With Thanks and mint API access tokens bound to photographer identity.

**Pros**

- standards-aligned,
- strong scope control,
- future-proof for other integrations,
- aligns with ChatGPT “connect your account” mental model.

**Cons**

- more implementation work initially.

### Option B (bridge): Connection exchange + long-lived personal token

Issue a long-lived integration token after manual account linking and store it for tool usage.

**Pros**

- faster prototype.

**Cons**

- weaker consent model,
- harder token hygiene/rotation,
- generally not ideal for production.

## How Better Auth being in-app helps now

Moving auth in-app is a net positive for this plan because you control:

- session and user lookups in server code,
- callback/origin behavior,
- DB-backed identity tables,
- extension points to add integration-token issuance/introspection.

Previously, a managed external auth boundary could make deep token customization slower. In-app Better Auth reduces that friction.

## Suggested scopes and permission boundaries

Start minimal:

- `events:create` (create event)
- `events:read` (list/read events)

Potential later scopes:

- `events:update`
- `events:delete`
- `credits:read`
- `credits:write`

Keep couple share-link flows out of ChatGPT tooling initially. Share tokens are collaboration credentials, not appropriate as integration auth credentials.

## Proposed request flow (end-to-end)

1. Photographer opens ChatGPT and tries With Thanks action.
2. ChatGPT prompts account connection.
3. User authenticates with With Thanks (via existing Better Auth sign-in UX).
4. User grants requested scopes.
5. ChatGPT stores With Thanks access/refresh token.
6. ChatGPT calls tool endpoint with bearer token.
7. With Thanks tool server validates token, scope, user, then calls existing event creation logic.
8. Tool returns event details and share link.

## Backend changes needed in this repo

### 1) Harden session validation now

- Replace `sessionToken.length > 0` with actual Better Auth session verification outcome.
- Ensure token user matches requested `authUserId` where applicable.

### 2) Add integration auth layer

- Token issuing (OAuth or equivalent),
- token verification/introspection,
- scope checks.

### 3) Add ChatGPT-facing API surface

- `POST /api/integrations/chatgpt/events` (or equivalent),
- strict schema validation using existing create-event schema patterns,
- idempotency key support.

### 4) Add audit + observability

- log actor (`userId`), app client id, scope, action, request id,
- track token failures, scope denials, and duplicate submissions.

## MCP, hosting, and transport considerations

### Should this be an MCP server, an Apps SDK server, or both?

For your immediate goal (photographer creates event from ChatGPT), prefer an **Apps SDK tool server** first.

- Apps SDK is the direct path for ChatGPT app actions and account-linking UX.
- MCP is more useful when you want the same tool surface consumable by multiple MCP-capable clients beyond ChatGPT.

Practical sequence:

1. Ship Apps SDK integration first.
2. If you later need broader ecosystem interoperability, add an MCP surface that calls the same domain service layer.

### Can it be hosted on Vercel in the same app bundle?

Yes. Hosting in the same Vercel project/app bundle is a sensible default.

Recommended deployment shape:

- Keep current web routes and Better Auth routes as-is.
- Add integration routes (for example under `/api/integrations/chatgpt/*`).
- Keep business logic in shared server modules so web UI and ChatGPT tools call the same use-cases.

Benefits:

- simpler secrets/env management,
- single deploy pipeline,
- shared logging/observability.

Tradeoff:

- stricter need for route-level rate limiting and operational isolation for integration traffic.

### Transport protocol guidance

Start with plain HTTPS request/response for mutation tools (`create_event`).

- It is easiest to make reliable and auditable.
- It aligns with idempotency key patterns and straightforward retries.

Add streaming/partial-result transport only if needed (e.g., long-running workflows, progress updates, large fan-out operations). For event creation, non-streaming is usually sufficient.

### Timeouts, retries, and idempotency

Even for non-streaming tool calls, treat network retries as normal behavior:

- require an idempotency key on create mutations,
- return deterministic duplicate-safe responses,
- keep tool handlers short-running and fail-fast on validation/auth errors.

### Recommended boundary in code

Use this layering so transport choice (Apps SDK vs MCP, streaming vs non-streaming) stays flexible:

1. **Domain service**: `createEventForPhotographer(...)` with authz + validation + persistence.
2. **Integration adapter(s)**: Apps SDK handler (and later MCP handler if needed).
3. **Transport glue**: HTTP route/stream plumbing + serialization.

This prevents lock-in to a single protocol and keeps core rules in one place.

## Product/UX guardrails

- Confirm ambiguous dates (“next Saturday”) before mutation.
- Return normalized date/timezone in confirmation.
- Return copy-friendly share link after creation.
- If mutation fails, explain exactly what to fix (e.g., invalid date).

## Rollout plan

1. **Auth hardening**: enforce real session validation in current server functions.
2. **Internal prototype**: one `create_event` tool with delegated token auth.
3. **Private beta**: limited photographers + audit dashboards.
4. **Expand**: add `list_events` and `get_event_share_link`.
5. **Later**: consider credit/supplier write actions after reliability targets.

## Bottom line

Your intuition is correct: for ChatGPT Apps, With Thanks should expose a proper delegated token mechanism (ideally OAuth) rather than rely on browser cookies. Because Better Auth is now in-app, implementing this is more straightforward than before, and your existing create-event server logic/validation can be reused with a thin integration layer.
