import { createServerFn } from '@tanstack/react-start'
import type { EventDetail, EventListItem } from '@/lib/types/front-end'
import { SHARE_TOKEN_MIN_LENGTH } from '@/lib/constants'
import {
  authUserIdSchema,
  createEventSchema,
  deleteEventSchema,
  getCreditsSchema,
  getEventSchema,
  sessionTokenSchema,
  shareTokenSchema,
} from '@/lib/types/validation-schema'
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEventsByUserId,
} from '@/db/queries/events'
import { generateToken } from '@/lib/utils'
import { ERROR } from '@/lib/errors'
import { getEventSuppliersWithSupplier } from '@/db/queries/event-suppliers'
import { isValidSession } from '@/db/queries/auth'

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
  .inputValidator(
    createEventSchema.extend({
      authUserId: authUserIdSchema,
      sessionToken: sessionTokenSchema,
    }),
  )
  .handler(async ({ data }): Promise<EventListItem> => {
    const isValid = await isValidSession(data.sessionToken)
    if (!isValid) throw ERROR.FORBIDDEN()

    const shareToken = generateToken(SHARE_TOKEN_MIN_LENGTH)

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
  .inputValidator(getEventSchema.extend({ authUserId: authUserIdSchema }))
  .handler(async ({ data }): Promise<EventDetail> => {
    const event = await getEventById(data.eventId)
    if (!event) throw ERROR.RESOURCE_NOT_FOUND('Event not found')
    if (event.createdByUserId !== data.authUserId) throw ERROR.FORBIDDEN()

    const eventSuppliers = await getEventSuppliersWithSupplier(data.eventId)

    return {
      id: event.id,
      eventName: event.eventName,
      weddingDate: event.weddingDate,
      shareToken: event.shareToken,
      supplierCount: eventSuppliers.length,
      credits: eventSuppliers.map((es) => ({
        id: es.supplier.id,
        name: es.supplier.name,
        email: es.supplier.email,
        instagramHandle: es.supplier.instagramHandle,
        tiktokHandle: es.supplier.tiktokHandle,
        service: es.service,
        contributionNotes: es.contributionNotes,
      })),
    }
  })

export const getEventForCoupleFn = createServerFn({
  method: 'GET',
})
  .inputValidator(getCreditsSchema.extend({ shareToken: shareTokenSchema }))
  .handler(async ({ data }): Promise<EventDetail> => {
    const event = await getEventById(data.eventId)
    if (!event) throw ERROR.RESOURCE_NOT_FOUND('Event not found')
    if (event.shareToken !== data.shareToken)
      throw ERROR.FORBIDDEN('Share token mismatch')

    const eventSuppliers = await getEventSuppliersWithSupplier(data.eventId)

    return {
      id: event.id,
      eventName: event.eventName,
      weddingDate: event.weddingDate,
      shareToken: event.shareToken,
      supplierCount: eventSuppliers.length,
      credits: eventSuppliers.map((es) => ({
        id: es.supplier.id,
        name: es.supplier.name,
        email: es.supplier.email,
        instagramHandle: es.supplier.instagramHandle,
        tiktokHandle: es.supplier.tiktokHandle,
        service: es.service,
        contributionNotes: es.contributionNotes,
      })),
    }
  })

export const deleteEventFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteEventSchema.extend({ authUserId: authUserIdSchema }))
  .handler(async ({ data }) => {
    const event = await getEventById(data.eventId)
    if (!event) {
      throw ERROR.RESOURCE_NOT_FOUND('Event not found')
    }
    if (event.createdByUserId !== data.authUserId) {
      throw ERROR.FORBIDDEN()
    }
    await deleteEvent(data.eventId, data.authUserId)
    return
  })
