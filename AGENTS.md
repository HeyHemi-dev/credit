# Project Overview

# Coding Standards

- Use `tryCatch`, `tryCatchSync` instead of try...catch; handle errors explicitly.
- Use `tryCatch` at step boundaries, not whole handlers. Helpers return data or throw; callers handle errors.
- Use Zod for validation/parsing.
- Prefer destructured results from `tryCatch` and Zod parsing.
- Use `AppError` instead of `throw new Error`.
- Be cautious of passing raw error messages.
- Use single-line ifs for simple guards. e.g. `if (isTrue) doThis()`
- Prefer naming bool const/property with `is*`, `has*` or similar verbs.
- Prefer Tailwind classes over overrides. If overriding 3+ times, extend the theme.
- Prefer native shadcn components.
- Prefer `grid`/`flex` + `gap` over `space-*`.
- Prefer `function` for declarations. Short inline callback arrows are fine.
- Prefer WET over premature DRY. Extract only after a pattern appears 3+ times.
- Do not extract single-use boolean predicates into helper functions. Inline them at call site.
- Keep returned object literals declarative. Avoid inline conditional spreads with complex expressions.
- Prefer absolute imports from `@/` over relative imports.
- Prefer narrow types; avoid `any`, `unknown` `z.unknown()` `z.optional()`. If required, add a comment/JS doc to explain why.

# Test Standards

- Prefer integration tests at key boundaries (HTTP/webhooks, DB, auth). Read-only, no C-U-D.
- Use unit tests only for pure logic with real branching/risk (scoring, parsing, transforms).
- Avoid brittle hardcoded values; use minimal fixtures/factories.
- Before adding a test, tell the user the production bug/regression it would catch. If none, it is a low-value test, skip it.
- Use `// Arrange`, `// Act`, `// Assert`.

# Workflow

- Run lint, typecheck, and tests before finishing.

# Guardrails

- Do not write raw SQL migrations. Use `pnpm db:generate`, or ask the user to generate them.
- Do not cast types without explaining why it is safe. Avoid if possible.
- Do not leak raw errors to the client/external sources.
