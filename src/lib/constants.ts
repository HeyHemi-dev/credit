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
