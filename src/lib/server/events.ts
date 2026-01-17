import { createServerFn } from '@tanstack/react-start'
import type { EventDetail, EventListItem } from '@/lib/types/front-end'
import { SHARE_LINK } from '@/lib/constants'
import {
  authUserIdSchema,
  createEventSchema,
  deleteEventSchema,
  getEventSchema,
} from '@/lib/types/validation-schema'
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEventsByUserId,
} from '@/db/queries/events'
import { generateToken } from '@/lib/utils'
import { ERROR } from '@/lib/errors'
import {
  assertEventOwnedByUser,
  getEventSuppliersWithSupplier,
} from '@/db/queries/event-suppliers'

export const listEventsFn = createServerFn({ method: 'GET' })
  .inputValidator(authUserIdSchema)
  .handler(async ({ data }): Promise<Array<EventListItem>> => {
    const events = await getEventsByUserId(data)
    return events.map((event) => ({
      id: event.id,
      eventName: event.eventName,
      weddingDate: event.weddingDate,
      supplierCount: event.supplierCount,
      shareToken: event.shareToken,
    }))
  })

export const createEventFn = createServerFn({ method: 'POST' })
  .inputValidator(createEventSchema)
  .handler(async ({ data }): Promise<EventListItem> => {
    const shareToken = generateToken(SHARE_LINK.TOKEN.MIN_LENGTH)

    const event = await createEvent({
      createdByUserId: data.authUserId,
      eventName: data.eventName,
      weddingDate: data.weddingDate,
      region: data.region,
      shareToken,
    })

    return {
      id: event.id,
      eventName: event.eventName,
      weddingDate: event.weddingDate,
      supplierCount: 0, // A new event has no suppliers yet
      shareToken: event.shareToken,
    }
  })

export const getEventFn = createServerFn({ method: 'GET' })
  .inputValidator(getEventSchema)
  .handler(async ({ data }): Promise<EventDetail> => {
    await assertEventOwnedByUser(data.eventId, data.authUserId)
    const event = await getEventById(data.eventId, data.authUserId)
    if (!event) {
      throw ERROR.RESOURCE_NOT_FOUND('Event not found')
    }

    const rows = await getEventSuppliersWithSupplier(data.eventId)

    return {
      id: event.id,
      eventName: event.eventName,
      weddingDate: event.weddingDate,
      supplierCount: rows.length,
      shareToken: event.shareToken,
      suppliers: rows.map((row) => ({
        id: row.supplier.id,
        name: row.supplier.name,
        email: row.supplier.email,
        instagramHandle: row.supplier.instagramHandle ?? null,
        tiktokHandle: row.supplier.tiktokHandle ?? null,
        service: row.service,
        contributionNotes: row.contributionNotes,
      })),
    }
  })
export const getEventByShareTokenFn = createServerFn({ method: 'GET' })
export const updateEventFn = createServerFn({ method: 'POST' })
export const deleteEventFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteEventSchema)
  .handler(async ({ data }) => {
    await assertEventOwnedByUser(data.eventId, data.authUserId)
    await deleteEvent(data.eventId, data.authUserId)
    return { ok: true }
  })
export const updateEventSuppliersFn = createServerFn({ method: 'POST' })
