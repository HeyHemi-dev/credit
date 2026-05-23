# Auth Token Refactor Notes

This note captures the follow-up work behind the auth token refactor tracked in `documentation/todo.md`.

## Goals

- Make client-side auth gating easier to express in UI and form submissions
- Make auth token shapes clearer at the API boundary
- Distinguish more explicitly between session-backed auth and share-token auth

## Proposed Direction

- Refine the auth schema naming to match the actual token model
- Create narrower schema variants for session auth and share auth
- Update hooks and server functions to pass the correct auth token shape instead of relying on `authUserId`
- Refactor server auth validation helpers to validate the appropriate auth mode for each route

## Suggested Shape

```ts
const authSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal(AUTH_STATUS.PENDING) }),
  z.object({ status: z.literal(AUTH_STATUS.UNAUTHENTICATED) }),
  z.object({
    status: z.literal(AUTH_STATUS.AUTHENTICATED),
    authType: z.literal(AUTH_TOKEN_TYPE.SESSION_TOKEN),
    authUserId: authUserIdSchema,
  }),
  z.object({
    status: z.literal(AUTH_STATUS.AUTHENTICATED),
    authType: z.literal(AUTH_TOKEN_TYPE.SHARE_TOKEN),
    shareToken: shareTokenSchema,
  }),
])
```

## Trust Model

- Session auth is more trusted than share-token auth
- Server auth helpers should validate session auth for routes that require authentication
- Server auth helpers should validate session auth or share-token auth for routes that support shared access

## Likely Touchpoints

- `src/hooks/use-auth.ts`
- `src/lib/types/validation-schema.ts`
- `src/lib/server/auth.ts`
- Hooks and serverFns that currently pass or validate auth state
