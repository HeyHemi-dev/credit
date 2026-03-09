// With Thanks — portfolio/case-study draft content
//
// Purpose: a repo-local working doc you can copy into `/Users/hemi/Dev/heyhemi/src/content/projects/*`
// Format: matches the `CaseStudy` structure used by `wedding-ready.ts`.
//
// Sources: README.md, documentation/*, and code paths in src/

export const withThanksCaseStudyDraft = {
  slug: 'with-thanks',
  name: 'With Thanks',
  excerpt:
    'Mobile-first wedding supplier tagging tool: send one link to the couple; get copy-ready, formatted supplier tags back for Instagram.',

  // TODO: add real image paths in heyhemi once exported
  heroImage: {
    src: '/with-thanks/hero.png',
    alt: 'With Thanks project preview',
  },

  // TODO: fill when ready
  liveUrl: undefined,
  repoUrl: undefined,

  oneLiner: 'One link. Copy-ready tags, with thanks.',
  roles: ['Founder', 'Full-Stack Dev', 'Design'],

  techStack: [
    {
      type: 'md',
      text: '**TanStack Start (Vite)** - full-stack React via server functions',
    },
    { type: 'md', text: '**TanStack Query**' },
    { type: 'md', text: '**TanStack Form**' },
    {
      type: 'md',
      text: '**TanStack Pacer** - debouncing, throttling, batching (search + UI state)',
    },
    {
      type: 'md',
      text: '**Zod** - runtime validation at the request boundary',
    },
    { type: 'md', text: '**Drizzle ORM** - typed data layer, no client-side queries' },
    { type: 'md', text: '**Neon Postgres** - DB branching for preview deployments' },
    {
      type: 'md',
      text: '**Neon Auth** (Better Auth) - photographer sign-in',
    },
    { type: 'md', text: '**Tailwind CSS + shadcn/ui**' },
    {
      type: 'md',
      text: '**Vercel** - deployment branching (preview deployments)',
    },
  ],

  problemSolution: {
    problem:
      'Wedding photographers want to tag every supplier accurately, but collecting handles/emails after the event is tedious and error-prone — so credits get missed or tagged inconsistently.',
    solution:
      'With Thanks turns credit collection into a low-friction collaboration: the photographer creates an event and shares one private link; the couple adds suppliers; the photographer gets copy-ready Instagram tags and email lists back.',
  },

  architecture: {
    diagram: {
      // Export `documentation/project-context/with-thanks-architecture-sequence.mmd` to SVG and place it in heyhemi.
      src: '/projects/with-thanks/architecture-sequence.svg',
      alt: 'Request flow architecture. Route renders, a hook calls a TanStack Start server function, the server function validates/authorizes, then Drizzle runs against Neon Postgres and returns a DTO back to the UI.',
      caption:
        'With Thanks request flow: routes and hooks call TanStack Start server functions, which validate/authorize before Drizzle queries run against Neon Postgres.',
    },
    content: [
      {
        type: 'md',
        text: [
          'With Thanks is a small full-stack app built on TanStack Start, where backend capabilities are expressed as type-safe server functions instead of a separate API service.',
          '',
          'I chose TanStack (Start + Router) for strong end-to-end type-safety at the routing boundary and its ergonomics for layering in middleware-style enforcement over time (planned). Zod fits cleanly into this: routes can validate and type search params, and server functions validate incoming payloads at the request boundary before any business logic runs.',
          '',
          'At a high level, routes render UI and delegate data loading and mutations to hooks (TanStack Query + `useServerFn`). Those hooks call server functions (`createServerFn`), which validate inputs and enforce authorization before executing database reads/writes.',
          '',
          'The client never talks to the database directly. All database reads and writes run server-side through Drizzle against Neon Postgres using server environment credentials. Client tokens are used strictly for request authorization, not for database access.',
          '',
          'A key product-specific detail is that the app supports two access modes (session dashboard vs share-link collaboration), but the architecture remains consistent: both modes still flow through the same server-function boundary.',
        ].join('\n'),
      },
      {
        type: 'ul',
        items: [
          {
            type: 'md',
            text: '**Route layer:** file-based routes compose UI and local state.',
          },
          {
            type: 'md',
            text: '**Hook layer:** TanStack Query caching/invalidation + `useServerFn` calls.',
          },
          {
            type: 'md',
            text: '**Server boundary:** server functions validate inputs and authorize capabilities.',
          },
          {
            type: 'md',
            text: '**Data layer:** Drizzle queries against Neon Postgres (server-side env creds).',
          },
        ],
      },
      {
        type: 'callout',
        title: 'Note',
        content:
          'The “two access modes” (session vs share link) is the most distinctive system behavior. It’s best explained as a deep dive, but it sits on top of this same request-flow architecture.',
      },
    ],
  },

  engineering: {
    caption:
      'Key constraints and decisions that shaped the product’s access model, UX, and data integrity.',
    rows: [
      {
        constraint:
          'Search is a core workflow, and typing-driven UX can easily create noisy requests and janky UI (especially with dedupe checks and “typeahead” search).',
        decision: {
          type: 'md',
          text: 'Adopted TanStack Pacer early for debounced/throttled state so high-frequency interactions (supplier search inputs, dedupe checks, and copy-to-clipboard feedback) stay responsive and “batch” into fewer requests.',
        },
        tradeOff:
          'Requires careful tuning of debounce/throttle timing and doesn’t replace server-side protections. Planned: expand into explicit rate-limiting patterns as usage grows.',
      },
      {
        constraint:
          'I wanted the UI to feel lightweight — actions like creating an event or tagging a supplier should feel quick, not like a “workflow” that pulls you away from what you were doing.',
        decision: {
          type: 'md',
          text: 'Used a drawer-first interaction pattern for common actions (e.g. create event, add/tag supplier) so forms appear in-context instead of full page navigations.',
        },
        tradeOff:
          'Drawers are effectively modal dialogs, so stacking portal-based UI primitives (popovers/selects/date pickers) can create “popup-on-popup” and focus/portaling issues. In practice this constrained some input choices in favor of simpler components.',
      },
      {
        constraint:
          'I envisioned the app being used primarily on a phone, and didn’t want to maintain separate “desktop vs mobile” layout complexity.',
        decision: {
          type: 'md',
          text: 'Constrained the main app layout to a phone-like max width so the UI stays consistent and easy to design for, even when opened on desktop.',
        },
        tradeOff:
          'The desktop experience intentionally doesn’t use the full screen. Some UI patterns need extra care at larger breakpoints to avoid looking sparse while keeping the phone-first feel.',
      },
      {
        constraint:
          'Encourage crowdsourcing of supplier information while minimizing duplicate suppliers as the database grows.',
        decision: {
          type: 'md',
          text: [
            'Allow couples to contribute supplier details, but with dedupe guardrails designed to keep the shared supplier database usable over time.',
            '',
            '- **Canonical identifier:** supplier email (supports future supplier profile claiming), enforced as a case-insensitive unique constraint on normalized email.',
            '- **UI guardrail:** a “did you mean…?” step that ranks potential duplicates using fuzzy matching on name/email plus email-domain signals (e.g. `hello@domain` vs `info@domain`).',
          ].join('\n'),
        },
        tradeOff:
          'Some duplicates will still slip through (aliases, generic inboxes, similar names). Over time, keeping the supplier database clean likely requires manual merge tools or admin workflows.',
      },
    ],
  },

  deepDive: {
    title: 'Dual access modes (session vs share link)',
    content: [
      { type: 'h3', text: 'The Problem' },
      {
        type: 'md',
        text: [
          'With Thanks has two very different user experiences:',
          '',
          '- Photographers need a protected dashboard to create and manage events.',
          '- Couples need to contribute supplier details with near-zero friction (no accounts, no onboarding).',
          '',
          'The architecture challenge is to make the couple experience extremely low-friction while keeping the higher-risk actions protected and permissions easy to reason about.',
        ].join('\n'),
      },

      { type: 'h3', text: 'What I Built' },
      {
        type: 'image',
        src: '/projects/with-thanks/access-mode-architecture.svg',
        alt: 'Access-mode architecture. Photographer uses a session-authenticated dashboard; couple uses a share-link token. Authorization happens in server functions before Drizzle queries run against Neon Postgres.',
        caption:
          'With Thanks access-mode architecture: session-authenticated event admin plus a share-link authenticated collaboration surface.',
      },
      {
        type: 'ul',
        items: [
          {
            type: 'md',
            text: '**Session-authenticated dashboard (photographer):** create/manage events and copy outputs.',
          },
          {
            type: 'md',
            text: '**Share-link authenticated collaboration (couple):** add suppliers and update credits via a private event link with a token in the URL.',
          },
          {
            type: 'md',
            text: '**Single backend surface:** both modes call the same TanStack Start server functions; each function enforces its own required auth.',
          },
          {
            type: 'md',
            text: '**Server-side persistence:** after authorization, all reads/writes happen server-side via Drizzle + Neon Postgres.',
          },
        ],
      },

      { type: 'h3', text: 'The Security Trade-off (and why it’s worth it)' },
      {
        type: 'md',
        text: [
          'A share link is inherently less secure than a signed-in account: it can be forwarded, screenshotted, or guessed if implemented poorly.',
          '',
          'I accepted that additional risk because the product’s core value depends on couples actually completing the data entry — and account creation would destroy the conversion rate for a one-time guest action.',
          '',
          'The key is scoping: the share-link mode is intentionally limited to collaboration actions, while event administration stays session-only.',
        ].join('\n'),
      },

      { type: 'h3', text: 'Capability scoping' },
      {
        type: 'ul',
        items: [
          {
            type: 'md',
            text: '**Session only (photographer):** manage events (create/list/delete) and access the full dashboard.',
          },
          {
            type: 'md',
            text: '**Session or share link:** collaboration on an event (view the event as a couple, add suppliers, add/remove credits).',
          },
        ],
      },

      { type: 'h3', text: 'Mitigations (current + planned hardening)' },
      {
        type: 'ul',
        items: [
          {
            type: 'md',
            text: '**Server-side authorization per function:** every write goes through a server function that checks required auth before hitting the database.',
          },
          {
            type: 'md',
            text: '**Planned: rotatable share links:** rotate the event’s share token to invalidate previously shared links without introducing permission levels or couple accounts.',
          },
          {
            type: 'md',
            text: '**Planned: additional abuse controls:** rate limiting and tighter scoping/validation as usage grows.',
          },
        ],
      },

      { type: 'h3', text: 'Outcome' },
      {
        type: 'ul',
        items: [
          'Photographers get a protected admin surface without adding friction for couples.',
          'Couples can contribute quickly from a phone without onboarding.',
          'Authorization stays explicit and capability-based at the server-function boundary, so the product can evolve without tangled permissions.',
        ],
      },
    ],
  },

  // TODO: choose final palette for heyhemi (these are placeholders)
  theme: {
    brandBg: '#0b3b35',
    indexBg: '#e8f3f0',
    descriptionBg: '#cfe7e2',
    imageBg: '#e8f3f0',
    imageFrameBg: '#c7dfd9',
    brandText: '#e8f3f0',
    indexText: '#0b3b35',
    descriptionText: '#0b3b35',
  },
} as const
