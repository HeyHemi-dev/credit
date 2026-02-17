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
    { type: 'md', text: '**TanStack Start (Vite)** - full-stack React via server functions' },
    { type: 'md', text: '**TanStack Router** - file-based routing' },
    { type: 'md', text: '**TanStack Query** - caching + mutations' },
    { type: 'md', text: '**TanStack Form** - typed form state' },
    { type: 'md', text: '**TanStack Pacer** - batching/debouncing (autosave UX)' },
    { type: 'md', text: '**Zod** - runtime validation at the request boundary' },
    { type: 'md', text: '**Drizzle ORM** - typed data layer' },
    { type: 'md', text: '**Neon Postgres** - primary database' },
    { type: 'md', text: '**Neon Auth (Better Auth) + Google OAuth** - photographer sign-in' },
    { type: 'md', text: '**Tailwind CSS + shadcn/ui** - UI system' },
    { type: 'md', text: '**Vercel** - hosting (planned/assumed from repo docs)' },
    { type: 'md', text: '**Vitest** - test runner' },
  ],

  problemSolution: {
    problem:
      'Wedding photographers want to tag every supplier accurately, but collecting handles/emails after the event is tedious and error-prone — so credits get missed or tagged inconsistently.',
    solution:
      'With Thanks turns credit collection into a low-friction collaboration: the photographer creates an event and shares one private link; the couple adds suppliers; the photographer gets copy-ready Instagram tags and email lists back.',
    technicalWhy:
      'The architecture centers on dual access modes: a session-authenticated dashboard for event administration, and a share-link authenticated guest flow for collaboration without creating accounts.',
  },

  architecture: {
    diagram: {
      // Export the Mermaid diagram to SVG and place it in heyhemi.
      src: '/projects/with-thanks/access-mode-architecture.svg',
      alt: 'Access-mode architecture. Photographer uses a session-authenticated dashboard; couple uses a share-link token. Authorization happens in server functions before Drizzle queries run against Neon Postgres.',
      caption:
        'With Thanks access-mode architecture: a session-authenticated photographer dashboard and a share-link authenticated couple collaboration flow.',
    },
    content: [
      {
        type: 'md',
        text: [
          'I designed With Thanks around two distinct access modes to minimize friction for couples while keeping photographers’ admin actions protected.',
          '',
          'Photographers use an account-based session (Neon Auth) to create and manage events, while couples never log in — instead they collaborate via a private event link that carries a share token.',
          '',
          'Both experiences call the same backend surface area (TanStack Start server functions), where authorization is enforced per function: session-required functions power event administration, and share-token functions allow only collaboration actions like viewing the event and adding/removing credits.',
          '',
          'After authorization, all persistence happens server-side through Drizzle queries using server environment credentials, so tokens are used strictly for request authorization rather than database access.',
          '',
          'Planned next step: make the couple link a single rotatable share link per event — photographers can rotate the token to invalidate any previously shared link without needing permission levels or couple accounts.',
        ].join('\n'),
      },
      {
        type: 'ul',
        items: [
          { type: 'md', text: '**Session (photographer):** event admin + collaboration capabilities.' },
          { type: 'md', text: '**Share link (couple):** collaboration-only capabilities (no event administration).' },
          { type: 'md', text: '**Server boundary:** Zod-validated inputs + per-function authorization.' },
          { type: 'md', text: '**Data layer:** Drizzle queries against Neon Postgres.' },
        ],
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

  deepDive: {
    title: 'Dual access modes (session vs share link)',
    content: [
      { type: 'h3', text: 'The Problem' },
      {
        type: 'md',
        text: [
          'With Thanks needs two different experiences:',
          '- a protected dashboard where photographers manage events, and',
          '- a zero-login collaboration flow where couples can add suppliers quickly.',
          '',
          'The architectural goal is to keep this split explicit so capabilities are easy to reason about and evolve.',
        ].join('\n'),
      },
      { type: 'h3', text: 'What I Built' },
      {
        type: 'ul',
        items: [
          'Session-authenticated event administration (create/list/manage events).',
          'Share-link authenticated collaboration (view event + add/remove credits).',
          'A single server-function surface where each function explicitly declares what auth is required.',
        ],
      },
      { type: 'h3', text: 'Planned Improvements' },
      {
        type: 'ul',
        items: [
          {
            type: 'md',
            text: '**Rotatable share links:** rotate token to invalidate previously shared links.',
          },
          {
            type: 'md',
            text: 'Optional future: per-link permissions (read-only vs edit) if user demand emerges.',
          },
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

