import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/db/connection'
import { eventSuppliers, events, suppliers } from '@/db/schema'
import { ERROR } from '@/lib/errors'

export type EventSupplierRow = typeof eventSuppliers.$inferSelect
export type NewEventSupplierRow = typeof eventSuppliers.$inferInsert

export type EventSupplierWithSupplier = EventSupplierRow & {
  supplier: typeof suppliers.$inferSelect
}

export async function upsertEventSupplier(
  input: NewEventSupplierRow,
): Promise<void> {
  await db
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
}

export async function removeSupplierFromEvent(
  eventId: string,
  supplierId: string,
): Promise<void> {
  await db
    .delete(eventSuppliers)
    .where(and(eq(eventSuppliers.eventId, eventId), eq(eventSuppliers.supplierId, supplierId)))
}

export async function getEventSuppliersWithSupplier(
  eventId: string,
): Promise<EventSupplierWithSupplier[]> {
  const rows = await db
    .select({
      eventId: eventSuppliers.eventId,
      supplierId: eventSuppliers.supplierId,
      service: eventSuppliers.service,
      contributionNotes: eventSuppliers.contributionNotes,
      createdAt: eventSuppliers.createdAt,
      updatedAt: eventSuppliers.updatedAt,
      supplier: suppliers,
    })
    .from(eventSuppliers)
    .innerJoin(suppliers, eq(eventSuppliers.supplierId, suppliers.id))
    .where(eq(eventSuppliers.eventId, eventId))
    .orderBy(asc(eventSuppliers.service), asc(suppliers.name))

  return rows.map((r) => ({
    eventId: r.eventId,
    supplierId: r.supplierId,
    service: r.service,
    contributionNotes: r.contributionNotes,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    supplier: r.supplier,
  }))
}

export async function assertEventOwnedByUser(
  eventId: string,
  createdByUserId: string,
): Promise<void> {
  const [row] = await db
    .select({ id: events.id })
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.createdByUserId, createdByUserId)))
    .limit(1)
  if (!row) throw ERROR.FORBIDDEN('Event not found or not owned by user')
}

