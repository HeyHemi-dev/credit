import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { SHARE_LINK } from '@/lib/constants'
import { createEventInputSchema } from '@/lib/validations'
import { requireUserId } from '@/lib/server/auth'
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEventsByUserId,
} from '@/db/queries/events'
import { ERROR } from '@/lib/errors'

export const listEventsFn = createServerFn({ method: 'GET' }).handler(
  async ({ request }) => {
    const userId = await requireUserId(request)
    return await getEventsByUserId(userId)
  },
)

export const createEventFn = createServerFn({ method: 'POST' })
  .inputValidator(createEventInputSchema)
  .handler(async ({ request, data }) => {
    const userId = await requireUserId(request)

    const eventId = crypto.randomUUID()
    const shareToken = crypto.randomUUID()

    if (shareToken.length < SHARE_LINK.TOKEN.MIN_LENGTH) {
      throw ERROR.INTERNAL_SERVER_ERROR('Generated share token too short')
    }

    return await createEvent({
      id: eventId,
      createdByUserId: userId,
      eventName: data.eventName,
      weddingDate: data.weddingDate,
      region: data.region,
      shareToken,
    })
  })

export const getEventFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      eventId: z.string().uuid(),
    }),
  )
  .handler(async ({ request, data }) => {
    const userId = await requireUserId(request)
    const event = await getEventById(data.eventId, userId)
    if (!event) throw ERROR.RESOURCE_NOT_FOUND('Event not found')
    return event
  })

export const deleteEventFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      eventId: z.string().uuid(),
    }),
  )
  .handler(async ({ request, data }) => {
    const userId = await requireUserId(request)
    await deleteEvent(data.eventId, userId)
    return { ok: true }
  })

