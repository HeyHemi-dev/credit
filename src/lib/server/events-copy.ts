import { createServerFn } from '@tanstack/react-start'
import type { EventListItem } from '@/lib/types/front-end'
import { SHARE_LINK } from '@/lib/constants'
import { ERROR } from '@/lib/errors'
import {
  authUserIdSchema,
  createEventSchema,
} from '@/lib/types/validation-schema'
import { createEvent, getEventsByUserId } from '@/db/queries/events'

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
  .handler(async ({ data }): Promise<EventListItem | void> => {
    const eventId = crypto.randomUUID()
    const shareToken = crypto.randomUUID()

    if (shareToken.length < SHARE_LINK.TOKEN.MIN_LENGTH) {
      throw ERROR.INTERNAL_SERVER_ERROR('Generated share token too short')
    }

    const event = await createEvent({
      id: eventId,
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
