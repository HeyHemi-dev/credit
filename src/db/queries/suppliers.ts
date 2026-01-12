import { and, eq, ilike, or, sql } from 'drizzle-orm'
import { db } from '@/db/connection'
import { suppliers } from '@/db/schema'
import { ERROR } from '@/lib/errors'
import { normalizeHandle } from '@/lib/validations'

export type SupplierRow = typeof suppliers.$inferSelect
export type NewSupplierRow = typeof suppliers.$inferInsert

export async function getSupplierById(id: string): Promise<SupplierRow | null> {
  const [row] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, id))
    .limit(1)
  return row ?? null
}

export async function getSupplierByEmail(
  email: string,
): Promise<SupplierRow | null> {
  const [row] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.email, email.toLowerCase().trim()))
    .limit(1)
  return row ?? null
}

export async function createSupplier(
  input: NewSupplierRow,
): Promise<SupplierRow> {
  try {
    const [row] = await db.insert(suppliers).values(input).returning()
    if (!row) throw ERROR.DATABASE_ERROR('Failed to create supplier')
    return row
  } catch (err) {
    // Unique email constraint is expected behavior.
    throw ERROR.RESOURCE_CONFLICT('Supplier email already exists')
  }
}

/**
 * V1 supplier search
 * Search by name, email, instagram_handle, tiktok_handle.
 */
export async function searchSuppliers(
  query: string,
  limit = 20,
): Promise<Array<SupplierRow>> {
  const q = query.trim()
  if (!q) return []

  const qLike = `%${q}%`
  const handleLike = `%${normalizeHandle(q)}%`

  const rows = await db
    .select()
    .from(suppliers)
    .where(
      or(
        ilike(suppliers.name, qLike),
        ilike(suppliers.email, qLike),
        // handle search should ignore leading '@'
        ilike(sql`${suppliers.instagramHandle}`, handleLike),
        ilike(sql`${suppliers.tiktokHandle}`, handleLike),
      ),
    )
    .limit(limit)

  return rows
}

export async function updateSupplierHandles(
  supplierId: string,
  input: Pick<SupplierRow, 'instagramHandle' | 'tiktokHandle'>,
): Promise<void> {
  await db
    .update(suppliers)
    .set({
      instagramHandle: input.instagramHandle,
      tiktokHandle: input.tiktokHandle,
      updatedAt: new Date(),
    })
    .where(eq(suppliers.id, supplierId))
}
