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
  instagramHandle: string | null
  tiktokHandle: string | null
}
