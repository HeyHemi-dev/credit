# With Thanks — CV/Portfolio Info Gathering Plan

## Goal
Create a complete, evidence-backed project summary for CV/portfolio entries based on this repo and its documentation.

This plan is intentionally structured to map into your `types.ts` project schema once those exact fields are available.

## What to collect

### 1) Project identity
- Project name and one-line summary
- Product category and target users
- Problem solved and value proposition
- Current scope and v1 boundaries

Primary sources:
- `README.md`
- `documentation/give-credit_promise.md`
- `documentation/give-credit_design-brief.md`
- `documentation/with-thanks_brand.md`

### 2) Your role and ownership
- Founder vs team context
- Product/design/engineering responsibilities
- Decision-making ownership (scope, architecture, UX, delivery)

Primary sources:
- Brand/marketing docs (for intent and positioning)
- Commit history and authorship (`git log`)
- Any personal notes (outside repo)

### 3) Product functionality (what you built)
- Core user flows (photographer flow + couple flow)
- Main entities and data model (events, suppliers, credits)
- Key UX constraints (mobile-first, autosave, no-submit couple flow)

Primary sources:
- `documentation/give-credit_v1-specs.md`
- `documentation/give-credit_design-brief.md`
- `src/routes/`
- `src/components/`
- `src/db/schema.ts`

### 4) Technical stack and architecture
- Front-end framework and routing model
- Back-end/data layer strategy
- Auth model
- Hosting/deployment notes

Primary sources:
- `documentation/give-credit_tech-stack.md`
- `README.md`
- `package.json`
- `src/lib/server/`
- `src/db/`

### 5) Notable implementation details (portfolio depth)
- Autosave/batching patterns
- Search + dedupe supplier creation flow
- Copy-output formatting logic
- Privacy/security tradeoffs for shared links

Primary sources:
- `documentation/give-credit_v1-specs.md`
- `documentation/privacy_facts_codebase.md`
- `src/lib/server/events.ts`
- `src/lib/server/suppliers.ts`
- `src/components/credit/`

### 6) Outcomes and evidence
- Usage/traction metrics (if available)
- Delivery milestones reached
- Product quality indicators (tests, constraints, DX decisions)

Primary sources:
- Existing analytics/logging setup (if any)
- Release notes / personal records
- `pnpm test`, build, and lint outputs

### 7) Visual/portfolio artifacts
- Logo/brand assets
- UI screenshots (public page, event workflow, couple workflow)
- Optional architecture diagram and flow diagram

Primary sources:
- `public/` assets
- Local dev environment screenshots

## Recommended workflow

### Step A — Define your output schema first
1. Paste your exact `types.ts` shape into a working doc.
2. Create a two-column mapping table:
   - Column 1: `types.ts` field
   - Column 2: evidence source(s) in this repo
3. Mark each field as:
   - ✅ easy (already in docs/code)
   - 🟡 inferable (needs synthesis)
   - 🔴 missing (needs your direct input/metrics)

### Step B — Extract facts from documentation
1. Read docs in this order:
   1. `give-credit_promise.md`
   2. `give-credit_design-brief.md`
   3. `give-credit_v1-specs.md`
   4. `give-credit_tech-stack.md`
   5. `with-thanks_brand.md`
   6. `with-thanks_marketing.md`
2. Capture only hard facts and explicit statements first.
3. Separate "fact" vs "interpretation" to keep CV language defensible.

### Step C — Validate claims against code
For each candidate portfolio claim, confirm in code:
- Is this flow actually implemented?
- Is this feature planned-only or live?
- Is this an architectural intent or shipped behavior?

Use file-level verification in:
- `src/routes/` for user journeys
- `src/lib/server/` for backend behavior
- `src/db/` for data model constraints

### Step D — Fill missing data from outside the repo
Some high-value CV fields are usually not in source code:
- Timeline/duration
- Team size/collaboration model
- Real metrics (users, events, time saved)
- Business impact/testimonials

Gather these from your notes, analytics, or memory.

### Step E — Draft three portfolio-ready variants
Produce 3 levels of project entry:
1. **Short CV bullet version** (2–4 bullets)
2. **Portfolio card version** (problem + solution + stack + outcome)
3. **Case study version** (challenge, decisions, implementation, tradeoffs, results)

## Suggested extraction template
Use this template while collecting, then map into `types.ts`:

- Name:
- Tagline:
- Period:
- Role:
- Users:
- Problem:
- Solution:
- Core features:
- Tech stack:
- Architecture highlights:
- Key decisions/tradeoffs:
- Challenges:
- Outcomes/metrics:
- Links (repo, live URL, images):
- What you’d improve next:

## Repo-first command checklist

Run these during extraction:

```bash
# 1) Read key docs quickly
rg --files documentation

# 2) Identify feature-related routes/components
rg "_appLayout|copy|supplier|event|shareToken" src/routes src/components

# 3) Confirm server capabilities
rg "createServerFn|searchSuppliers|dedupe|getEvent" src/lib/server

# 4) Confirm schema-level facts
sed -n '1,260p' src/db/schema.ts

# 5) Capture stack/dependencies
cat package.json
```

## Practical notes for your current request
- Because `types.ts` and `wedding-ready.ts` are outside this repo, the most reliable approach is:
  1. extract facts here,
  2. then map them directly into your existing schema in your other project.
- Keep uncertain claims out of the final CV output unless you can verify with either code or real usage data.

## Definition of done
You are done when every `types.ts` field is either:
- filled with a verified value,
- intentionally left null/empty with a reason, or
- marked as pending external data (metrics/timeline).
