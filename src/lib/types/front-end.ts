import type { Region, Service } from '@/lib/constants'

export type EventListItem = {
  id: string
  eventName: string
  weddingDate: string
  supplierCount: number
  shareToken: string
}

export type EventSupplier = {
  id: string
  name: string
  email: string
  instagramHandle: string | null
  tiktokHandle: string | null
  service: Service
  contributionNotes: string | null
}

export type EventDetail = EventListItem & {
  credits: Array<EventSupplier>
}

export type EventCreditPage = {
  eventName: string
  credits: Array<EventSupplier>
}

export type SupplierSearchResult = {
  id: string
  name: string
  email: string
  region: Region
  instagramHandle: string
  tiktokHandle: string
}
