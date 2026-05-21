import { eq, ilike, or } from 'drizzle-orm'
import type { SupplierClaimSearchResult } from '@/lib/types/front-end'
import { db } from '@/db/connection'
import { supplierClaims, suppliers } from '@/db/schema'
import { ERROR } from '@/lib/errors'
import { normalizeHandle } from '@/lib/formatters'
import { tryCatch } from '@/lib/try-catch'

export type SupplierClaimRow = typeof supplierClaims.$inferSelect
type SupplierClaimSearchRow = {
  supplier: typeof suppliers.$inferSelect
  claimStatus: SupplierClaimSearchResult['claimStatus']
}

export async function getSupplierOwnedByUserId(userId: string) {
  const [row] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.claimedByUserId, userId))
    .limit(1)

  return row ?? null
}

export async function getSupplierClaimByUserId(userId: string) {
  const [row] = await db
    .select({
      claim: supplierClaims,
      supplier: suppliers,
    })
    .from(supplierClaims)
    .innerJoin(suppliers, eq(supplierClaims.supplierId, suppliers.id))
    .where(eq(supplierClaims.userId, userId))
    .limit(1)

  return row ?? null
}

export async function searchSuppliersForClaim(
  query: string,
  userId: string,
): Promise<Array<SupplierClaimSearchRow>> {
  const q = query.trim()
  if (!q) return []

  const handleLike = `%${normalizeHandle(q)}%`
  const qLike = `%${q}%`

  return await db
    .select({
      supplier: suppliers,
      claim: supplierClaims,
    })
    .from(suppliers)
    .leftJoin(supplierClaims, eq(supplierClaims.supplierId, suppliers.id))
    .where(
      or(
        ilike(suppliers.name, qLike),
        ilike(suppliers.emailDomain, qLike),
        ilike(suppliers.instagramHandle, handleLike),
        ilike(suppliers.tiktokHandle, handleLike),
      ),
    )
    .limit(20)
    .then<Array<SupplierClaimSearchRow>>((rows) =>
      rows.map((row) => ({
        supplier: row.supplier,
        claimStatus:
          row.supplier.claimedByUserId === userId
            ? 'claimedByYou'
            : row.supplier.claimedByUserId
              ? 'claimed'
              : row.claim && row.claim.userId !== userId
                ? 'pending'
                : 'available',
      })),
    )
}

export async function createOrUpdateSupplierClaim(
  supplierId: string,
  userId: string,
) {
  const ownedSupplier = await getSupplierOwnedByUserId(userId)
  if (ownedSupplier) {
    if (ownedSupplier.id === supplierId) throw ERROR.INVALID_STATE('You already own this supplier profile')
    throw ERROR.RESOURCE_CONFLICT('You already have a claimed supplier profile')
  }

  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, supplierId))
    .limit(1)
  if (!supplier) throw ERROR.RESOURCE_NOT_FOUND('Supplier not found')

  if (supplier.claimedByUserId && supplier.claimedByUserId !== userId) {
    throw ERROR.RESOURCE_CONFLICT('This supplier has already been claimed')
  }

  const [existingClaimForSupplier] = await db
    .select()
    .from(supplierClaims)
    .where(eq(supplierClaims.supplierId, supplierId))
    .limit(1)
  if (existingClaimForSupplier && existingClaimForSupplier.userId !== userId) {
    throw ERROR.RESOURCE_CONFLICT('This supplier already has a pending claim request')
  }

  const [existingClaimForUser] = await db
    .select()
    .from(supplierClaims)
    .where(eq(supplierClaims.userId, userId))
    .limit(1)

  if (existingClaimForUser?.supplierId === supplierId) {
    if (existingClaimForUser.status === 'pending') return existingClaimForUser

    const { data: rows, error } = await tryCatch(
      db
        .update(supplierClaims)
        .set({
          status: 'pending',
          updatedAt: new Date(),
        })
        .where(eq(supplierClaims.userId, userId))
        .returning(),
    )

    if (error) throw ERROR.DATABASE_ERROR('Failed to update supplier claim')
    if (rows.length === 0) throw ERROR.DATABASE_ERROR('Failed to update supplier claim')
    return rows[0]
  }

  if (existingClaimForUser) {
    const { data: rows, error } = await tryCatch(
      db
        .update(supplierClaims)
        .set({
          supplierId,
          status: 'pending',
          updatedAt: new Date(),
        })
        .where(eq(supplierClaims.userId, userId))
        .returning(),
    )

    if (error) throw ERROR.DATABASE_ERROR('Failed to update supplier claim')
    if (rows.length === 0) throw ERROR.DATABASE_ERROR('Failed to update supplier claim')
    return rows[0]
  }

  const { data: rows, error } = await tryCatch(
    db
      .insert(supplierClaims)
      .values({
        supplierId,
        userId,
        status: 'pending',
      })
      .returning(),
  )

  if (error) throw ERROR.DATABASE_ERROR('Failed to create supplier claim')
  if (rows.length === 0) throw ERROR.DATABASE_ERROR('Failed to create supplier claim')
  return rows[0]
}
