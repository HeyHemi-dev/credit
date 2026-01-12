import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import type { EventListItem } from '@/lib/types/front-end'
import { SHARE_LINK } from '@/lib/constants'
import { ERROR } from '@/lib/errors'
import { createEventSchema } from '@/lib/types/validation-schema'
import { createEvent, getEventsByUserId } from '@/db/queries/events'
import { authUserId } from '@/lib/server/auth-client'

export const listEventsFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<EventListItem> | void> => {
    const userId = await authUserId()
    if (!userId) {
      setResponseStatus(401)
      return
    }
    const events = await getEventsByUserId(userId)
    return events.map((event) => ({
      id: event.id,
      eventName: event.eventName,
      weddingDate: event.weddingDate,
      supplierCount: event.supplierCount,
      shareToken: event.shareToken,
    }))
  },
)

export const createEventFn = createServerFn({ method: 'POST' })
  .inputValidator(createEventSchema)
  .handler(async ({ data }): Promise<EventListItem | void> => {
    const userId = await authUserId()
    if (!userId) {
      setResponseStatus(401)
      return
    }

    const eventId = crypto.randomUUID()
    const shareToken = crypto.randomUUID()

    if (shareToken.length < SHARE_LINK.TOKEN.MIN_LENGTH) {
      throw ERROR.INTERNAL_SERVER_ERROR('Generated share token too short')
    }

    const event = await createEvent({
      id: eventId,
      createdByUserId: userId,
      eventName: data.eventName,
      weddingDate: data.weddingDate,
      region: data.region,
      shareToken,
    })

    setResponseStatus(200)

    return {
      id: event.id,
      eventName: event.eventName,
      weddingDate: event.weddingDate,
      supplierCount: 0, // A new event has no suppliers yet
      shareToken: event.shareToken,
    }
  })
