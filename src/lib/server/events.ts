import { createServerFn } from '@tanstack/react-start'
import type { EventListItem } from '@/lib/types/front-end'
import { SHARE_LINK } from '@/lib/constants'
import {
  authUserIdSchema,
  createEventSchema,
} from '@/lib/types/validation-schema'
import { createEvent, getEventsByUserId } from '@/db/queries/events'
import { generateToken } from '@/lib/utils'

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
export const getEventByShareTokenFn = createServerFn({ method: 'GET' })
export const updateEventFn = createServerFn({ method: 'POST' })
export const deleteEventFn = createServerFn({ method: 'POST' })
export const updateEventSuppliersFn = createServerFn({ method: 'POST' })
