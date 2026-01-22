import { desc, eq, ilike, or, sql } from 'drizzle-orm'
import { db } from '@/db/connection'
import { suppliers } from '@/db/schema'
import { ERROR } from '@/lib/errors'
import { normalizeEmail, normalizeHandle } from '@/lib/formatters'
import { tryCatch } from '@/lib/try-catch'

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

// export async function getSupplierByEmail(
//   email: string,
// ): Promise<SupplierRow | null> {
//   const normalizedEmail = normalizeEmail(email)
//   const [row] = await db
//     .select()
//     .from(suppliers)
//     .where(eq(suppliers.email, normalizedEmail))
//     .limit(1)
//   return row ?? null
// }

export async function createSupplier(
  input: NewSupplierRow,
): Promise<SupplierRow> {
  const normalizedInput = {
    ...input,
    name: input.name.trim(),
    email: normalizeEmail(input.email),
    instagramHandle:
      input.instagramHandle && normalizeHandle(input.instagramHandle),
    tiktokHandle: input.tiktokHandle && normalizeHandle(input.tiktokHandle),
  }
  const { data: rows, error } = await tryCatch(
    db.insert(suppliers).values(normalizedInput).returning(),
  )

  // Unique email constraint is expected behavior.
  if (error) throw ERROR.RESOURCE_CONFLICT('Supplier email already exists')
  if (rows.length === 0) throw ERROR.DATABASE_ERROR('Failed to create supplier')
  return rows[0]
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
        ilike(suppliers.emailDomain, qLike),
        // handle search should ignore leading '@'
        ilike(sql`${suppliers.instagramHandle}`, handleLike),
        ilike(sql`${suppliers.tiktokHandle}`, handleLike),
      ),
    )
    .limit(limit)

  return rows
}

// export async function updateSupplierHandles(
//   supplierId: string,
//   input: Pick<SupplierRow, 'instagramHandle' | 'tiktokHandle'>,
// ): Promise<void> {
//   const normalizedInput = {
//     instagramHandle:
//       input.instagramHandle && normalizeHandle(input.instagramHandle),
//     tiktokHandle: input.tiktokHandle && normalizeHandle(input.tiktokHandle),
//   }
//   await db
//     .update(suppliers)
//     .set({
//       instagramHandle: normalizedInput.instagramHandle,
//       tiktokHandle: normalizedInput.tiktokHandle,
//       updatedAt: new Date(),
//     })
//     .where(eq(suppliers.id, supplierId))
// }

export async function findSupplierDedupeCandidates(
  input: Pick<SupplierRow, 'email' | 'name'>,
  limit = 10,
) {
  const qName = input.name.trim().toLowerCase()
  const qEmail = normalizeEmail(input.email)

  // since suppliers.emailDomain is generated from email, compute the query domain once
  const qDomain = qEmail.includes('@') ? qEmail.split('@').pop()! : ''

  const nameSim = sql<number>`similarity(unaccent(lower(${suppliers.name})), unaccent(${qName}))`
  const emailSim = sql<number>`similarity(lower(${suppliers.email}), ${qEmail})`
  const emailExact = sql<number>`case when lower(${suppliers.email}) = ${qEmail} then 1 else 0 end`
  const domainMatch = sql<number>`case when ${suppliers.emailDomain} = ${qDomain} then 1 else 0 end`

  const confidence = sql<number>`(
    10 * ${emailExact} +
     3 * ${domainMatch} +
     4 * ${nameSim} +
     2 * ${emailSim}
  )`

  const nameClose = sql<boolean>`unaccent(lower(${suppliers.name})) % unaccent(${qName})`
  const emailClose = sql<boolean>`lower(${suppliers.email}) % ${qEmail}`

  // only use the domain filter when qDomain is non-empty
  const domainFilter = qDomain
    ? eq(suppliers.emailDomain, qDomain)
    : sql<boolean>`false`

  return db
    .select()
    .from(suppliers)
    .where(or(domainFilter, nameClose, emailClose))
    .orderBy(desc(confidence))
    .limit(limit)
}
