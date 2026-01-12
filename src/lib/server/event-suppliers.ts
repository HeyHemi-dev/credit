import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { AUTOSAVE, RATE_LIMITS } from '@/lib/constants'
import { ERROR } from '@/lib/errors'
import { getEventByShareToken } from '@/db/queries/events'
import { requireUserId } from '@/lib/server/auth'
import {
  assertEventOwnedByUser,
  getEventSuppliersWithSupplier,
  removeSupplierFromEvent,
  upsertEventSupplier,
} from '@/db/queries/event-suppliers'
import { upsertEventSupplierInputSchema } from '@/lib/validations'
import { db } from '@/db/connection'
import { eventSuppliers, suppliers } from '@/db/schema'

export const getEventSuppliersFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      eventId: z.string().uuid(),
    }),
  )
  .handler(async ({ request, data }) => {
    const userId = await requireUserId(request)
    await assertEventOwnedByUser(data.eventId, userId)
    const rows = await getEventSuppliersWithSupplier(data.eventId)
    return { rows }
  })

export const getEventSuppliersForCoupleFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      shareToken: z.string().trim().min(32),
    }),
  )
  .handler(async ({ data }) => {
    const event = await getEventByShareToken(data.shareToken)
    if (!event) throw ERROR.RESOURCE_NOT_FOUND('Invalid link')
    const rows = await getEventSuppliersWithSupplier(event.id)
    return { event, rows }
  })

export const upsertEventSupplierForCoupleFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      shareToken: z.string().trim().min(32),
      item: upsertEventSupplierInputSchema.omit({ eventId: true }),
    }),
  )
  .handler(async ({ data }) => {
    const event = await getEventByShareToken(data.shareToken)
    if (!event) throw ERROR.RESOURCE_NOT_FOUND('Invalid link')

    // Guardrail: max new suppliers per event (counts junction rows, not global suppliers)
    const countRows = await db
      .select({ count: db.$count(eventSuppliers) })
      .from(eventSuppliers)
      .where(eq(eventSuppliers.eventId, event.id))
    const count = countRows[0]?.count ?? 0
    if (count >= RATE_LIMITS.MAX_NEW_SUPPLIERS_PER_EVENT) {
      throw ERROR.BUSINESS_RULE_VIOLATION('Too many suppliers for this event')
    }

    await upsertEventSupplier({
      eventId: event.id,
      supplierId: data.item.supplierId,
      service: data.item.service,
      contributionNotes: data.item.contributionNotes,
    })

    return { ok: true, autosaveIntervalMs: AUTOSAVE.INTERVAL_MS }
  })

export const removeEventSupplierForCoupleFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      shareToken: z.string().trim().min(32),
      supplierId: z.string().uuid(),
    }),
  )
  .handler(async ({ data }) => {
    const event = await getEventByShareToken(data.shareToken)
    if (!event) throw ERROR.RESOURCE_NOT_FOUND('Invalid link')
    await removeSupplierFromEvent(event.id, data.supplierId)
    return { ok: true }
  })
