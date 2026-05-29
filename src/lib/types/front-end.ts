import type { Region, Service } from '@/lib/constants'

export type EventListItem = {
  id: string
  eventName: string
  weddingDate: string
  supplierCount: number
  shareToken: string
}

export type Credit = {
  id: string
  name: string
  email: string
  instagramHandle: string | null
  tiktokHandle: string | null
  service: Service
  contributionNotes: string | null
}

export type EventDetail = EventListItem & {
  credits: Array<Credit>
}

export type Supplier = {
  id: string
  name: string
  email: string
  region: Region | null
  regionsServed: Array<Region>
  services: Array<Service>
  website: string | null
  instagramHandle: string | null
  tiktokHandle: string | null
}

export type SupplierClaimStatus = 'pending' | 'claimed'

export type SupplierClaimVerification = {
  email: string
  lastSentAt: string | null
}

export type SupplierClaim = {
  supplier: Supplier
  status: SupplierClaimStatus
  verification: SupplierClaimVerification | null
}

export type SupplierClaimSearchResult = Supplier & {
  claimStatus: 'available' | 'pending' | 'claimed' | 'claimedByYou'
}
