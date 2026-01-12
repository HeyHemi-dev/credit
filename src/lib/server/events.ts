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

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/17037db5-3e4a-43c3-8a86-d6aac6646a48', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'run_create_event',
        hypothesisId: 'CE4',
        location: 'src/lib/server/events.ts:createEventFn',
        message: 'createEventFn handler entry',
        data: {
          hasUserId: !!userId,
          eventNameLen: data.eventName.trim().length,
          weddingDate: data.weddingDate,
          hasRegion: !!data.region,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

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
