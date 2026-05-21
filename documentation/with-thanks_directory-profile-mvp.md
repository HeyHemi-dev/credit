# With Thanks Directory / Profile MVP

## Purpose

Record the product decisions for the first public supplier directory and profile layer so implementation can happen later without reopening the same scope questions.

This document covers:

- public profile fields
- URL and slug strategy
- rating model
- what is free vs paid
- account ownership model for suppliers

## Current decisions

- A **supplier** remains a **business/brand record**, not a person.
- MVP uses **1 user -> 1 supplier**.
- Public supplier URLs use `/wedding-suppliers/:slug-:publicId`.
- `publicId` is a stable **6-character** public identifier.
- Ratings use **thumbs up / thumbs down** with an **optional comment**.
- Any logged-in user can leave a rating/review.
- Rating comments go live immediately.
- Review summary should use a smarter trust score than a straight average.
- Recent negatives should weigh heavily, more than recent positives.
- Negative impact should fade faster with age than positive trust.
- Public UI should emphasize score + badges rather than expose raw scoring logic.
- Every supplier can exist in the shared data layer and be tagged, added to events, and reviewed.
- Claimed suppliers get a public profile on the free tier and can edit it.
- Long-term direction: paid suppliers are the ones shown in the directory.
- MVP exception: unpaid suppliers will still be shown in the directory for now.

## Open decisions

- exact future paid feature set beyond directory inclusion

## 1. Supplier model

### Decision

Use **1 user -> 1 supplier** for MVP claiming and profile ownership.

### Why

- It matches the current product shape, where supplier records are single business entities.
- It avoids shipping account-switching UI before there is proven demand.
- It keeps claiming, permissions, editing, and billing simpler.
- It aligns with the existing product rule in [documentation/give-credit_v1-specs.md](/Users/hemi/.codex/worktrees/3ead/credit/documentation/give-credit_v1-specs.md) that one business with multiple brands should be represented as multiple suppliers.

### Explicit non-goal

Do **not** support `1 user -> many suppliers` in MVP.

That model adds:

- supplier-switching UI
- a membership/role model
- more complex claim resolution
- more complex billing questions
- more ambiguous review ownership and moderation

### Revisit trigger

Revisit multi-supplier accounts only after we see real demand from:

- studios that operate multiple brands
- one operator managing separate photo/video brands
- teams managing several directory listings under one login

If that happens later, the likely shape is:

- `users`
- `supplier_memberships`
- one active supplier context in the UI

But that is future architecture, not MVP scope.

## 2. Public profile MVP

### Public fields in MVP

These fields can appear on a public supplier profile:

- business name
- rating summary
- claimed/verified status shown as a badge or tick
- `based in` region using the existing supplier `region` field
- `serves` regions as a new multi-value field
- services offered as a multi-value field
- short bio
- instagram handle
- tiktok handle
- phone
- website
- reviews/ratings

### Field rules

- `email` remains **required but private**
- `bio` is optional and should stay short, around tweet length
- public contact details are optional
- `based in` region should follow the current supplier field optionality
- `serves` regions and `services offered` should follow the same optional/required approach the product already uses for region and services unless we explicitly change that later

### Open detail

- `serves` regions is a new field and likely needs an array/set-style representation
- `services offered` is a profile-level multi-value field, separate from event-specific service tagging
- the exact meaning of `claimed` vs `verified` may still need a tighter definition later even if the UI uses one trust badge

## 3. Directory MVP

Directory behavior is partially decided.

### Inclusion rule for now

- all claimed suppliers appear in the directory
- this includes both free and paid claimed suppliers

### Longer-term direction

- directory inclusion is expected to become the paid gate later
- the current all-claimed inclusion rule is a rollout decision, not necessarily the permanent monetization model

### MVP directory capabilities

- browse all claimed suppliers
- filter by `serves` regions
- filter by `services offered`
- allow user-selectable sorting by rating or name

### Directory listing content

Each directory card/list item should show:

- business name
- services offered
- `based in`
- `serves`
- rating summary and badge

### Default sort

- default sort is `rating`

### Out of scope for MVP directory

- search by business name
- filter by `based in`

### Still to decide

- default ranking details behind the rating sort

## 4. URL and slug strategy

### Canonical URL shape

Public supplier profile URLs use:

- `/wedding-suppliers/:slug-:publicId`

Example:

- `/wedding-suppliers/studio-milou-3f2k9x`

The public directory should live at:

- `/wedding-suppliers`

### Public ID

- `publicId` is a stable public identifier
- it is **6 characters**
- it is not a secret token
- it exists to keep URLs stable even if the supplier name changes

### Slug behavior

- the slug is derived from the supplier name
- suppliers can change their business name later
- when the business name changes, the slug should change too
- the `publicId` remains the stable identity part of the URL

### Redirect behavior

These non-canonical forms should resolve to the right supplier and redirect to the current canonical URL:

- `/wedding-suppliers/:publicId`
- `/wedding-suppliers/:oldSlug-:publicId`

Examples:

- `/wedding-suppliers/3f2k9x` redirects to `/wedding-suppliers/studio-milou-3f2k9x`
- `/wedding-suppliers/milou-3f2k9x` redirects to `/wedding-suppliers/studio-milou-3f2k9x`

### Canonical and SEO behavior

- only the current canonical URL should be rendered as the canonical page URL
- stale slug URLs and ID-only URLs should redirect to the canonical URL
- sitemap should contain only canonical supplier profile URLs

### Why this approach

This supports the three main goals:

- SEO
- human-friendly/readable URLs
- stable links even if the supplier name changes

### Future scaling note

`6` characters is the chosen MVP length and is expected to be sufficient for the current NZ-focused scope.

If scale ever grows beyond that, the app can support longer public ID lengths later by:

- keeping existing 6-character IDs valid
- allowing the route parser to support multiple valid lengths
- generating longer IDs for future suppliers if needed

## 5. Rating model

Decision recorded at a high level.

### Rating format

- rating input is `thumbs up` or `thumbs down`
- written comment is optional

### Who can rate

- any logged-in supplier/user can leave a rating/review

### Publishing behavior

- comments are public immediately
- ratings are public immediately

### Trust score behavior

- do **not** use a straight average as the main trust summary
- use a smarter trust score that accounts for volume and recency
- recent negatives should matter a lot
- a new negative should outweigh several new positives
- multiple recent negatives should trigger a strong visible downgrade
- positive trust should build more slowly and persist longer
- negative impact should fade faster over time than positive trust

### Review visibility

- old negative reviews should remain publicly visible even after their ranking impact fades
- reviews should display timestamps, ideally in relative form

### Public summary direction

- public UI should emphasize the score rather than the algorithm
- show a number plus badge-style trust cues
- low-review suppliers can remain unrated until they reach a threshold
- badges can be used for things like `new entrant` / `early reviews`, `highly trusted`, and `many reviews`

### Out of MVP

- reporting flows
- supplier flagging flows
- admin moderation/review tooling
- pre-approval before reviews go live

### Still to decide

- whether there are any limits such as one rating per user or rating-edit behavior
- exact threshold rules for `not yet rated` / `early reviews`
- exact badge wording and criteria

## 6. Free vs paid

Decision recorded at a high level.

### Shared supplier layer

- every supplier can exist in the system data layer
- suppliers can be tagged, added to events, and reviewed regardless of claim/payment state

### Free claimed profile

- claimed suppliers get a public profile even on the free tier
- claimed supplier profiles can be edited by their owner
- in the free state, the public profile is available if someone knows the URL

### Directory gate

Long-term intended direction:

- paid suppliers are included in the public directory

MVP / current rollout exception:

- unpaid suppliers will still appear in the directory for now

This means the directory should be designed with the expectation that payment can later become the inclusion gate without rethinking the whole model.

### Implication

The product distinction is shaping up as:

- supplier exists in platform data: base layer
- supplier is claimed: public profile enabled and owner-editable
- supplier is paid: directory inclusion gate in the intended future model

### Still to decide

- what additional paid features exist beyond directory inclusion
- whether any profile features are paid-only later

## 7. Implications for later implementation

Known implication from the `1 user -> 1 supplier` decision:

- supplier ownership can stay simple in MVP because the app does not need supplier-switching UI or a membership model

Possible later additions, depending on the remaining decisions:

- supplier `slug`
- supplier public/claim status
- supplier ownership link to a user
- supplier rating table
- public supplier profile route
- public directory route

The existing supplier email uniqueness and dedupe rules remain important because ratings and profile ownership become more valuable once public pages exist.

## 8. MVP boundaries

This document does **not** commit us to building all directory/profile work in one PR.

It only settles the product decisions so the work can be broken into smaller pieces later:

1. claiming model
2. supplier-owned profile fields
3. public profile page
4. directory page
5. ratings
6. moderation and paid extensions
