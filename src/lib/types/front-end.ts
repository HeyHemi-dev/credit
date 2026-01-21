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
  service: string
  contributionNotes: string | null
}

export type EventDetail = EventListItem & {
  suppliers: Array<EventSupplier>
}

export type EventCreditPage = {
  eventName: string
  credits: Array<EventSupplier>
}

export type SupplierSearchResult = {
  id: string
  name: string
  email: string
  region: string
  instagramHandle: string
  tiktokHandle: string
}

export type CoupleEvent = {
  event: {
    id: string
    eventName: string
    weddingDate: string
    region: string | null
    shareToken: string
  }
  rows: Array<{
    eventId: string
    supplierId: string
    service: string
    contributionNotes: string | null
    supplier: {
      id: string
      name: string
      email: string
      instagramHandle: string | null
      tiktokHandle: string | null
      region: string | null
    }
  }>
}
