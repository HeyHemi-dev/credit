import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/db/connection'
import { eventSuppliers, events } from '@/db/schema'
import { ERROR } from '@/lib/errors'

export type EventRow = typeof events.$inferSelect
export type NewEventRow = typeof events.$inferInsert

export async function createEvent(input: NewEventRow): Promise<EventRow> {
  const [row] = await db.insert(events).values(input).returning()
  if (!row) throw ERROR.DATABASE_ERROR('Failed to create event')
  return row
}

export async function getEventsByUserId(
  createdByUserId: string,
): Promise<Array<EventRow & { supplierCount: number }>> {
  const rows = await db
    .select({
      id: events.id,
      createdByUserId: events.createdByUserId,
      eventName: events.eventName,
      weddingDate: events.weddingDate,
      region: events.region,
      shareToken: events.shareToken,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
      supplierCount: db.$count(
        eventSuppliers,
        eq(eventSuppliers.eventId, events.id),
      ),
    })
    .from(events)
    .where(eq(events.createdByUserId, createdByUserId))
    .orderBy(desc(events.weddingDate), desc(events.createdAt))

  return rows
}

export async function getEventById(
  id: string,
  createdByUserId: string,
): Promise<EventRow | null> {
  const [row] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, id), eq(events.createdByUserId, createdByUserId)))
    .limit(1)
  return row ?? null
}

export async function getEventByShareToken(
  shareToken: string,
): Promise<EventRow | null> {
  const [row] = await db
    .select()
    .from(events)
    .where(eq(events.shareToken, shareToken))
    .limit(1)
  return row ?? null
}

export async function deleteEvent(
  id: string,
  createdByUserId: string,
): Promise<void> {
  await db
    .delete(events)
    .where(and(eq(events.id, id), eq(events.createdByUserId, createdByUserId)))
}
