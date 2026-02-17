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
    { type: 'md', text: '**TanStack Router** - file-based routing' },
    { type: 'md', text: '**TanStack Query** - caching + mutations' },
    { type: 'md', text: '**TanStack Form** - typed form state' },
    {
      type: 'md',
      text: '**TanStack Pacer** - debounced/throttled UI state (search + UX polish)',
    },
    {
      type: 'md',
      text: '**Zod** - runtime validation at the request boundary',
    },
    { type: 'md', text: '**Drizzle ORM** - typed data layer' },
    { type: 'md', text: '**Neon Postgres** - primary database' },
    {
      type: 'md',
      text: '**Neon Auth (Better Auth) + Google OAuth** - photographer sign-in',
    },
    { type: 'md', text: '**Tailwind CSS + shadcn/ui** - UI system' },
    {
      type: 'md',
      text: '**Vercel** - hosting (planned/assumed from repo docs)',
    },
    { type: 'md', text: '**Vitest** - test runner' },
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
          'Couples need to contribute supplier details without onboarding friction (no accounts, no passwords, no “submit” ceremony).',
        decision: {
          type: 'md',
          text: 'Built a share-link authenticated collaboration surface where possession of a private event token authorizes scoped edits.',
        },
        tradeOff:
          'Token security becomes a first-class concern: links can be forwarded or leaked, so the system needs rotation/revocation and careful capability scoping.',
      },
      {
        constraint:
          'Search is a core workflow, and typing-driven UX can easily create noisy requests and janky UI (especially with dedupe checks and “typeahead” search).',
        decision: {
          type: 'md',
          text: 'Adopted TanStack Pacer early for debounced and throttled state so high-frequency interactions (supplier search inputs, dedupe checks, and copy-to-clipboard feedback) stay responsive without spamming requests.',
        },
        tradeOff:
          'Requires careful tuning of debounce/throttle timing and doesn’t replace server-side protections. Planned: expand into batching and rate-limiting patterns as usage grows.',
      },
      {
        constraint:
          'Supplier tagging needs to be copy-ready (consistent ordering + formatting) even when some data is missing (e.g. no Instagram handle).',
        decision: {
          type: 'md',
          text: 'Centralized output formatting into utilities that sort by service order and fall back to supplier names when handles are missing.',
        },
        tradeOff:
          'You must keep the formatting rules in sync with evolving UX requirements, and ensure the DTOs contain the minimal fields needed for outputs.',
      },
      {
        constraint:
          'The supplier database must stay usable over time (avoid duplicate suppliers, normalize handles/emails, and keep credits consistent).',
        decision: {
          type: 'md',
          text: 'Used a normalized schema (events, suppliers, event_suppliers) with uniqueness on supplier email and a composite key for credits.',
        },
        tradeOff:
          'Dedupe and data quality become ongoing product work; some correctness is enforced in DB constraints, and some must be handled via UI/validation.',
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
