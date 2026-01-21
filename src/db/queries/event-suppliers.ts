import { and, asc, eq } from 'drizzle-orm'
import type { SupplierRow } from '@/db/queries/suppliers'
import { db } from '@/db/connection'
import {
  eventSupplierColumns,
  eventSuppliers,
  events,
  supplierColumns,
  suppliers,
} from '@/db/schema'
import { ERROR } from '@/lib/errors'

export type EventSupplierRow = typeof eventSuppliers.$inferSelect
export type NewEventSupplierRow = typeof eventSuppliers.$inferInsert

export type EventSupplierWithSupplier = EventSupplierRow & {
  supplier: typeof suppliers.$inferSelect
}

export async function upsertEventSupplier(
  input: NewEventSupplierRow,
): Promise<EventSupplierRow> {
  const [row] = await db
    .insert(eventSuppliers)
    .values(input)
    .onConflictDoUpdate({
      target: [eventSuppliers.eventId, eventSuppliers.supplierId],
      set: {
        service: input.service,
        contributionNotes: input.contributionNotes,
        updatedAt: new Date(),
      },
    })
    .returning()
  return row
}

export async function removeSupplierFromEvent(
  eventId: string,
  supplierId: string,
): Promise<void> {
  await db
    .delete(eventSuppliers)
    .where(
      and(
        eq(eventSuppliers.eventId, eventId),
        eq(eventSuppliers.supplierId, supplierId),
      ),
    )
}

export async function deleteEventSupplier(
  eventId: string,
  supplierId: string,
): Promise<void> {
  await db
    .delete(eventSuppliers)
    .where(
      and(
        eq(eventSuppliers.eventId, eventId),
        eq(eventSuppliers.supplierId, supplierId),
      ),
    )
}

export async function getEventSuppliersByEventId(
  eventId: string,
): Promise<Array<EventSupplierRow>> {
  const rows = await db
    .select()
    .from(eventSuppliers)
    .where(eq(eventSuppliers.eventId, eventId))
    .orderBy(asc(eventSuppliers.createdAt))
  return rows
}

export async function getEventSuppliersWithSupplier(
  eventId: string,
): Promise<Array<EventSupplierRow & { supplier: SupplierRow }>> {
  return db
    .select({
      ...eventSupplierColumns,
      supplier: supplierColumns,
    })
    .from(eventSuppliers)
    .innerJoin(suppliers, eq(eventSuppliers.supplierId, suppliers.id))
    .where(eq(eventSuppliers.eventId, eventId))
    .orderBy(asc(eventSuppliers.service), asc(suppliers.name))
}

export async function assertEventOwnedByUser(
  eventId: string,
  createdByUserId: string,
): Promise<void> {
  const [row] = await db
    .select({ id: events.id })
    .from(events)
    .where(
      and(eq(events.id, eventId), eq(events.createdByUserId, createdByUserId)),
    )
    .limit(1)
  if (!row) throw ERROR.FORBIDDEN('Event not found or not owned by user')
}
