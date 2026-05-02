import { createServerFn } from '@tanstack/react-start'
import type { EventDetail, EventListItem } from '@/lib/types/front-end'
import {
  AUTH_STATUS,
  AUTH_TOKEN_TYPE,
  SHARE_TOKEN_MIN_LENGTH,
} from '@/lib/constants'
import {
  authTokenSchema,
  createEventSchema,
  deleteEventSchema,
  getCreditsByShareTokenSchema,
  getCreditsSchema,
  getEventSchema,
} from '@/lib/types/validation-schema'
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEventByShareToken,
  getEventsByUserId,
} from '@/db/queries/events'
import { generateToken } from '@/lib/generate-token'
import { ERROR } from '@/lib/errors'
import { getEventSuppliersWithSupplier } from '@/db/queries/event-suppliers'
import { requireValidatedSession } from '@/db/queries/auth'
import { isValidAuthToken } from '@/lib/server/auth'
import { isSessionAuth } from '@/hooks/use-auth'

export const listEventsFn = createServerFn({ method: 'GET' })
  .inputValidator(authTokenSchema)
  .handler(async ({ data }): Promise<Array<EventListItem>> => {
    if (!isSessionAuth(data)) throw ERROR.NOT_AUTHENTICATED()

    const { user } = await requireValidatedSession()

    const events = await getEventsByUserId(user.id)
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
    if (!isSessionAuth(data.authToken)) throw ERROR.NOT_AUTHENTICATED()

    const { user } = await requireValidatedSession()

    const shareToken = generateToken(SHARE_TOKEN_MIN_LENGTH)
    const event = await createEvent({
      createdByUserId: user.id,
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
    if (!isSessionAuth(data.authToken)) throw ERROR.NOT_AUTHENTICATED()

    const { user } = await requireValidatedSession()

    const event = await getEventById(data.eventId)
    if (!event) throw ERROR.RESOURCE_NOT_FOUND('Event not found')
    if (event.createdByUserId !== user.id) {
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

/**
 * @deprecated
 */
export const getEventForCoupleFn = createServerFn({
  method: 'GET',
})
  .inputValidator(getCreditsSchema.extend({ authToken: authTokenSchema }))
  .handler(async ({ data }): Promise<EventDetail> => {
    if (!(await isValidAuthToken(data.authToken)))
      throw ERROR.NOT_AUTHENTICATED()

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

export const getEventForCoupleByShareTokenFn = createServerFn({
  method: 'GET',
})
  .inputValidator(
    getCreditsByShareTokenSchema.extend({ authToken: authTokenSchema }),
  )
  .handler(async ({ data }): Promise<EventDetail> => {
    const hasMatchingShareToken =
      data.authToken.status === AUTH_STATUS.AUTHENTICATED &&
      data.authToken.tokenType === AUTH_TOKEN_TYPE.SHARE_TOKEN &&
      data.authToken.token === data.shareToken
    if (!hasMatchingShareToken) throw ERROR.NOT_AUTHENTICATED()

    const event = await getEventByShareToken(data.shareToken)
    if (!event) throw ERROR.NOT_AUTHENTICATED()
    const eventSuppliers = await getEventSuppliersWithSupplier(event.id)

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
    if (!isSessionAuth(data.authToken)) throw ERROR.NOT_AUTHENTICATED()

    const { user } = await requireValidatedSession()

    const event = await getEventById(data.eventId)
    if (!event) throw ERROR.RESOURCE_NOT_FOUND('Event not found')

    if (event.createdByUserId !== user.id) {
      throw ERROR.FORBIDDEN()
    }

    await deleteEvent(data.eventId, user.id)
    return
  })
