import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { AUTOSAVE, RATE_LIMITS } from '@/lib/constants'
import { ERROR } from '@/lib/errors'
import { getEventByShareToken } from '@/db/queries/events'
import { requireUserId } from '@/lib/server/auth'
import type { CoupleEvent } from '@/lib/types/front-end'
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
  .handler(async ({ request, data }): Promise<{ rows: CoupleEvent['rows'] }> => {
    const userId = await requireUserId(request)
    await assertEventOwnedByUser(data.eventId, userId)
    const rows = await getEventSuppliersWithSupplier(data.eventId)
    return {
      rows: rows.map((row) => ({
        eventId: row.eventId,
        supplierId: row.supplierId,
        service: row.service,
        contributionNotes: row.contributionNotes,
        supplier: {
          id: row.supplier.id,
          name: row.supplier.name,
          email: row.supplier.email,
          instagramHandle: row.supplier.instagramHandle ?? null,
          tiktokHandle: row.supplier.tiktokHandle ?? null,
          region: row.supplier.region ?? null,
        },
      })),
    }
  })

export const getEventSuppliersForCoupleFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      shareToken: z.string().trim().min(32),
    }),
  )
  .handler(async ({ data }): Promise<CoupleEvent> => {
    const event = await getEventByShareToken(data.shareToken)
    if (!event) throw ERROR.RESOURCE_NOT_FOUND('Invalid link')
    const rows = await getEventSuppliersWithSupplier(event.id)
    return {
      event: {
        id: event.id,
        eventName: event.eventName,
        weddingDate: event.weddingDate,
        region: event.region ?? null,
        shareToken: event.shareToken,
      },
      rows: rows.map((row) => ({
        eventId: row.eventId,
        supplierId: row.supplierId,
        service: row.service,
        contributionNotes: row.contributionNotes,
        supplier: {
          id: row.supplier.id,
          name: row.supplier.name,
          email: row.supplier.email,
          instagramHandle: row.supplier.instagramHandle ?? null,
          tiktokHandle: row.supplier.tiktokHandle ?? null,
          region: row.supplier.region ?? null,
        },
      })),
    }
  })

export const upsertEventSupplierForCoupleFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      eventId: z.string().uuid().optional(),
      item: upsertEventSupplierInputSchema.omit({ eventId: true }),
    }),
  )
  .handler(async ({ data }) => {
    if (!data.eventId) {
      return { ok: true, autosaveIntervalMs: AUTOSAVE.INTERVAL_MS }
    }
    // Guardrail: max new suppliers per event (counts junction rows, not global suppliers)
    const countRows = await db
      .select({ count: db.$count(eventSuppliers) })
      .from(eventSuppliers)
      .where(eq(eventSuppliers.eventId, data.eventId))
    const count = countRows[0]?.count ?? 0
    if (count >= RATE_LIMITS.MAX_NEW_SUPPLIERS_PER_EVENT) {
      throw ERROR.BUSINESS_RULE_VIOLATION('Too many suppliers for this event')
    }

    await upsertEventSupplier({
      eventId: data.eventId,
      supplierId: data.item.supplierId,
      service: data.item.service,
      contributionNotes: data.item.contributionNotes,
    })

    return { ok: true, autosaveIntervalMs: AUTOSAVE.INTERVAL_MS }
  })

export const removeEventSupplierForCoupleFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      eventId: z.string().uuid(),
      supplierId: z.string().uuid(),
    }),
  )
  .handler(async ({ data }) => {
    await removeSupplierFromEvent(data.eventId, data.supplierId)
    return { ok: true }
  })
