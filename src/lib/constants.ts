import type { ConstEnum } from '@/lib/generic-types'

// New Zealand wedding supplier services
export const SERVICE = {
  // Place & food
  VENUE: 'Venue',
  ACCOMODATION: 'Accommodation',
  CATERER: 'Catering',
  CAKE: 'Cake',
  // Capture
  PHOTOGRAPHER: 'Photographer',
  VIDEOGRAPHER: 'Videographer',
  // Outfit
  BRIDAL_WEAR: 'Bridal wear',
  BRIDESMAIDS_WEAR: 'Bridesmaid wear',
  BRIDAL_ACCESSORY: 'Bridal accessory',
  MENSWEAR: 'Menswear',
  MENSWEAR_ACCESSORY: 'Menswear accessory',
  RINGS: 'Rings',
  // Beauty
  MAKEUP: 'Makeup',
  HAIR: 'Hair',
  BEAUTY: 'Beauty',
  // Organise
  PLANNER: 'Planner',
  CELEBRANT: 'Celebrant',
  MC: 'MC',
  // Style
  FLORIST: 'Florist',
  STYLIST: 'Stylist',
  HIRE: 'Hire',
  STATIONERY: 'Stationery',
  // Vibes
  BAND: 'Band',
  ENTERTAINMENT: 'Entertainment',
  // Logistics
  TRANSPORT: 'Transport',
  SUPPORT: 'Support',
} as const satisfies ConstEnum

export type ServiceKey = keyof typeof SERVICE
export const SERVICE_KEYS = Object.keys(SERVICE) as Array<ServiceKey>
export type Service = (typeof SERVICE)[ServiceKey]
export const SERVICES = Object.values(SERVICE)

// New Zealand wedding supplier regions
export const REGION = {
  NORTHLAND: 'Northland',
  AUCKLAND: 'Auckland',
  WAIKATO: 'Waikato',
  BAY_OF_PLENTY: 'Bay of Plenty',
  GISBORNE: 'Gisborne',
  HAWKES_BAY: "Hawke's Bay",
  TARANAKI: 'Taranaki',
  MANAWATU_WHANGANUI: 'Manawatū–Whanganui',
  WELLINGTON: 'Wellington',
  NELSON_TASMAN: 'Nelson–Tasman',
  MARLBOROUGH: 'Marlborough',
  WEST_COAST: 'West Coast',
  CANTERBURY: 'Canterbury',
  OTAGO: 'Otago',
  SOUTHLAND: 'Southland',
} as const satisfies ConstEnum

export type RegionKey = keyof typeof REGION
export const REGION_KEYS = Object.keys(REGION) as Array<RegionKey>
export type Region = (typeof REGION)[RegionKey]
export const REGIONS = Object.values(REGION)

/**
 * V1 app-level constants and defaults
 * Keep hard-coded values centralized here for easy updating.
 */

export const AUTH = {
  PROVIDER: {
    GOOGLE: 'google',
  },
} as const

export const SHARE_LINK = {
  /**
   * V1 decision: token must be unguessable.
   * Use a CSPRNG-derived token (UUIDv4 via crypto.randomUUID() is acceptable).
   */
  TOKEN: {
    KIND: 'uuid',
    MIN_LENGTH: 32,
  },
  PATH_PREFIX: '/couple',
} as const

export const AUTOSAVE = {
  /**
   * V1 decision: batched autosave approximately every minute.
   */
  INTERVAL_MS: 60_000,
} as const

export const RATE_LIMITS = {
  /**
   * Guardrail to reduce spam; used by server-side create supplier flow.
   * This should be generous enough for real weddings, but prevent abuse.
   */
  MAX_NEW_SUPPLIERS_PER_EVENT: 50,
} as const

export const CREDIT_OUTPUT = {
  INSTAGRAM: {
    LINE_TEMPLATE: '[service] - [value]',
    VALUE_PREFIX: '@',
    LINE_SEPARATOR: '\n',
  },
  EMAIL: {
    SEPARATOR: ', ',
  },
} as const

export const VALIDATION = {
  HANDLE: {
    /**
     * Accepts common IG/TikTok handle characters (after stripping leading @).
     * Note: platform rules can change; keep this conservative.
     */
    REGEX: /^[a-z0-9._]{1,30}$/,
    MIN_LENGTH: 1,
    MAX_LENGTH: 30,
  },
} as const

export const UI_TEXT = {
  BRAND: 'Credit',

  COUPLE_INTRO: {
    TITLE: 'Help us credit your suppliers',
    BODY:
      "Add the suppliers you used so your photographer can credit and thank them properly. No login needed — you can come back anytime. We'll auto-save as you go.",
    CTA: 'Start adding suppliers',
  },

  AUTOSAVE: {
    SAVED: 'Saved',
    SAVING: 'Saving…',
    NOT_SAVED_MISSING_FIELD: 'Not saved - missing field',
  },

  EMPTY_STATES: {
    EVENTS: 'No events yet. Create your first event to generate a private link for your couple.',
  },
} as const
