# Account/Auth Route Refactor Notes

This note captures a future refactor for the auth and account route structure.

## Why

The current route setup still reflects a more flexible auth UI pattern:

- `src/routes/(public)/_publicLayout/auth/$pathname.tsx`
- `src/routes/(app)/_appLayout.account.$pathname.tsx`
- `src/components/auth/auth-client.tsx`

That made sense when auth screens were mostly one configurable surface. It is less clean now that account settings mixes:

- Better Auth UI components
- custom settings UI
- supplier-claim settings UI

As a result, `auth-client.tsx` currently owns both the Better Auth shell and route-specific page composition.

## Recommendation

Prioritize refactoring the account routes first.

Move from:

- `src/routes/(app)/_appLayout.account.$pathname.tsx`

Toward explicit route files such as:

- `src/routes/(app)/_appLayout.account.settings.tsx`
- `src/routes/(app)/_appLayout.account.security.tsx`

## Expected Benefits

- clearer route ownership
- no `pathname` prop threading for account pages
- less conditional route switching inside `src/components/auth/auth-client.tsx`
- easier per-page titles, loaders, auth guards, and suspense boundaries
- cleaner separation between Better Auth provider setup and account page content

## Scope

Refactor the account/settings routes first.

The public auth route can likely stay dynamic for now:

- `src/routes/(public)/_publicLayout/auth/$pathname.tsx`

That route is still mostly a pass-through to Better Auth's preferred pathname-based API. It is lower priority unless we later want stricter route definitions or page-specific copy/layout.

## Likely End State

- `src/components/auth/auth-client.tsx` keeps the Better Auth provider shell and header auth widgets
- account page composition moves into route files or account-specific page components
- shared account navigation can stay in a layout-level component
