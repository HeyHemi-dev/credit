import { createServerFn } from '@tanstack/react-start'
import type { EventDetail, EventListItem } from '@/lib/types/front-end'
import { SHARE_TOKEN_MIN_LENGTH } from '@/lib/constants'
import {
  authTokenSchema,
  createEventSchema,
  deleteEventSchema,
  getCreditsSchema,
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
import { getEventSuppliersWithSupplier } from '@/db/queries/event-suppliers'
import { isValidSession } from '@/db/queries/auth'
import { isValidAuthToken } from '@/lib/server/auth'
import { isSessionAuthToken } from '@/hooks/use-auth-token'

export const listEventsFn = createServerFn({ method: 'GET' })
  .inputValidator(authTokenSchema)
  .handler(async ({ data }): Promise<Array<EventListItem>> => {
    if (!isSessionAuthToken(data) || !isValidSession(data.token))
      throw ERROR.NOT_AUTHENTICATED()

    const events = await getEventsByUserId(data.authUserId)
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
      authToken: authTokenSchema,
    }),
  )
  .handler(async ({ data }): Promise<EventListItem> => {
    if (
      !isSessionAuthToken(data.authToken) ||
      !isValidSession(data.authToken.token)
    )
      throw ERROR.NOT_AUTHENTICATED()

    const shareToken = generateToken(SHARE_TOKEN_MIN_LENGTH)
    const event = await createEvent({
      createdByUserId: data.authToken.authUserId,
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
  .inputValidator(getEventSchema.extend({ authToken: authTokenSchema }))
  .handler(async ({ data }): Promise<EventDetail> => {
    if (
      !isSessionAuthToken(data.authToken) ||
      !isValidSession(data.authToken.token)
    )
      throw ERROR.NOT_AUTHENTICATED()

    const event = await getEventById(data.eventId)
    if (!event) throw ERROR.RESOURCE_NOT_FOUND('Event not found')
    if (event.createdByUserId !== data.authToken.authUserId) {
      throw ERROR.FORBIDDEN()
    }

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
  .inputValidator(getCreditsSchema.extend({ authToken: authTokenSchema }))
  .handler(async ({ data }): Promise<EventDetail> => {
    if (!isValidAuthToken(data.authToken)) throw ERROR.NOT_AUTHENTICATED()

    const event = await getEventById(data.eventId)
    if (!event) throw ERROR.RESOURCE_NOT_FOUND('Event not found')
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
  .inputValidator(deleteEventSchema.extend({ authToken: authTokenSchema }))
  .handler(async ({ data }) => {
    if (
      !isSessionAuthToken(data.authToken) ||
      !isValidSession(data.authToken.token)
    )
      throw ERROR.NOT_AUTHENTICATED()

    const event = await getEventById(data.eventId)
    if (!event) throw ERROR.RESOURCE_NOT_FOUND('Event not found')

    if (event.createdByUserId !== data.authToken.authUserId) {
      throw ERROR.FORBIDDEN()
    }

    await deleteEvent(data.eventId, data.authToken.authUserId)
    return
  })
