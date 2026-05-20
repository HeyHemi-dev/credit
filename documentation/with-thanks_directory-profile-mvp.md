# With Thanks Directory / Profile MVP

## Purpose

Record the product decisions for the first public supplier directory and profile layer so implementation can happen later without reopening the same scope questions.

This document covers:

- public profile fields
- URL and slug strategy
- rating model
- what is free vs paid
- account ownership model for suppliers

## Summary decisions

- A **supplier** remains a **business/brand record**, not a person.
- MVP uses **1 user -> 1 supplier**.
- Public profile URLs use a **supplier-owned slug** with an ID fallback for collisions and future slug changes.
- Directory/profile MVP is **free**.
- Ratings are **simple, event-linked, and tightly scoped** in v1.
- Paid features stay **out of MVP**. We define the likely upgrade path now, but do not build pricing or payments yet.

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

### Goal

Make supplier records useful and trustworthy as public web pages without requiring a large profile-editing system on day one.

### Public fields in MVP

These fields can appear on a public supplier profile:

- business name
- region
- instagram handle, if present
- tiktok handle, if present
- services offered
- average rating, if the supplier has enough ratings to show one
- rating count
- short profile status:
  - `Unclaimed profile`
  - `Claimed profile`

### Public fields not in MVP

Do not show these publicly in MVP:

- email address
- contribution notes from events
- event names, couple names, or wedding dates
- any raw event-level data that could identify a couple
- long-form bio
- website URL
- phone number
- gallery images
- pricing
- badges, featured placements, or ads

### Rationale

The current database already captures enough structured business identity to make a usable first profile. Keeping MVP narrow reduces privacy risk and avoids creating a half-finished profile editor.

## 3. Directory MVP

### Goal

Make suppliers discoverable in a lightweight, SEO-friendly way.

### Directory capabilities in MVP

- browse supplier profiles
- search by business name
- filter by service
- filter by region
- sort by a simple default ranking

### Default ranking

Use a practical default ranking, not a marketplace-style relevance system:

1. claimed profiles first
2. profiles with complete social data next
3. higher rated profiles next
4. alphabetical fallback

This is enough for MVP and avoids inventing a paid-placement ranking model too early.

## 4. URL and slug strategy

### Decision

Each supplier gets one canonical public URL:

`/suppliers/:slug`

### Slug source

- Start from normalized business name.
- Slug is stored on the supplier record, not generated on every request.
- Slug should be editable later by the claimed owner, but not required for MVP.

### Collision handling

When the preferred slug is already taken, append a short stable suffix.

Example:

- `studio-milou`
- `studio-milou-nz`
- `studio-milou-3f2k`

### Canonical fallback

Also support an internal ID-based fallback pattern for resolution safety:

`/suppliers/:slug-:idFragment`

The product should expose the clean slug URL publicly, but implementation should preserve a stable way to resolve profiles even if:

- names change
- slugs change later
- duplicate business names exist

### Guardrails

- Slugs are unique across suppliers.
- Slugs should be reserved once assigned.
- Redirect old slugs to the current slug once editable slugs exist.

## 5. Rating model

### Goal

Add enough social proof to improve trust and discovery without opening a wide moderation surface immediately.

### MVP rating input

Ratings should come only from authenticated photographers tied to real event usage.

Recommended MVP rule:

- a supplier can be rated only by the photographer who created an event that includes that supplier
- one rating per supplier per event

### MVP rating format

- 1 to 5 star rating
- optional short private moderation note for internal review later
- no public written review text in MVP

### Public display rules

- show average star rating
- show total rating count
- hide the average until a minimum threshold is reached

Recommended threshold:

- do not show a public average until there are at least **3** ratings

Before that, show:

- `Not enough ratings yet`

### Why this model

- It is low-friction for photographers.
- It is harder to abuse than open public reviews.
- It avoids launching review text moderation at the same time as profile claiming and directory pages.
- It ties ratings to real use of the supplier inside the product.

### Out of MVP

- public written reviews
- ratings from couples
- supplier replies
- report/review workflows beyond basic internal removal
- complex Bayesian or weighted ranking models

## 6. Free vs paid

### Decision

Directory/profile MVP is **free**.

### What is free in MVP

- public supplier profile
- appearance in directory search and browse
- profile claim
- editing the basic profile fields that become claim-managed later
- ratings collection and rating display

### What is not in MVP

- paid tiers
- subscriptions
- boosted placement
- lead capture
- analytics dashboards
- custom domain/profile links
- premium gallery or richer profile modules

### Why

- The current product is explicitly free today in public-facing copy and terms.
- Charging before the profile layer is useful would add friction in the wrong place.
- A free profile helps seed supply, improve data quality, and validate whether suppliers care enough to claim and maintain listings.

### Likely paid path later

If the directory proves valuable, paid features should sit on top of a strong free base. The most plausible future paid bundle is:

- richer profile content
- portfolio/gallery modules
- website link and contact CTA controls
- analytics
- featured placement or sponsorship labels

Those are intentionally future decisions, not MVP commitments.

## 7. Implications for later implementation

When implementation starts, the likely additions are:

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
