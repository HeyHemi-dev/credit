import { eq, ilike, or } from 'drizzle-orm'
import type { SupplierClaimSearchResult } from '@/lib/types/front-end'
import { db } from '@/db/connection'
import { supplierClaimVerifications, supplierClaims, suppliers } from '@/db/schema'
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

export async function getSupplierById(supplierId: string) {
  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, supplierId))
    .limit(1)

  return supplier ?? null
}

export async function getSupplierClaimByUserId(userId: string) {
  const [row] = await db
    .select({
      claim: supplierClaims,
      supplier: suppliers,
      verification: supplierClaimVerifications,
    })
    .from(supplierClaims)
    .innerJoin(suppliers, eq(supplierClaims.supplierId, suppliers.id))
    .leftJoin(
      supplierClaimVerifications,
      eq(supplierClaimVerifications.supplierClaimId, supplierClaims.id),
    )
    .where(eq(supplierClaims.userId, userId))
    .limit(1)

  return row ?? null
}

export async function getSupplierClaimRowBySupplierId(supplierId: string) {
  const [row] = await db
    .select()
    .from(supplierClaims)
    .where(eq(supplierClaims.supplierId, supplierId))
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

  const rows = await db
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

  return rows.map((row) => {
    let claimStatus: SupplierClaimSearchResult['claimStatus'] = 'available'

    if (row.supplier.claimedByUserId === userId) claimStatus = 'claimedByYou'
    else if (row.supplier.claimedByUserId) claimStatus = 'claimed'
    else if (row.claim && row.claim.userId !== userId) claimStatus = 'pending'

    return {
      supplier: row.supplier,
      claimStatus,
    }
  })
}

export async function createSupplierClaim(supplierId: string, userId: string) {
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

export async function resetSupplierClaim(
  claimId: string,
  supplierId: string,
) {
  const { data: rows, error } = await tryCatch(
    db
      .update(supplierClaims)
      .set({
        supplierId,
        status: 'pending',
        updatedAt: new Date(),
      })
      .where(eq(supplierClaims.id, claimId))
      .returning(),
  )

  if (error) throw ERROR.DATABASE_ERROR('Failed to update supplier claim')
  if (rows.length === 0) throw ERROR.DATABASE_ERROR('Failed to update supplier claim')
  return rows[0]
}

export async function approveSupplierClaim(claimId: string) {
  const { data: rows, error } = await tryCatch(
    db
      .update(supplierClaims)
      .set({
        status: 'approved',
        updatedAt: new Date(),
      })
      .where(eq(supplierClaims.id, claimId))
      .returning(),
  )

  if (error) throw ERROR.DATABASE_ERROR('Failed to approve supplier claim')
  if (rows.length === 0) throw ERROR.DATABASE_ERROR('Failed to approve supplier claim')
  return rows[0]
}

export async function claimSupplierForUser(supplierId: string, userId: string) {
  const { data: rows, error } = await tryCatch(
    db
      .update(suppliers)
      .set({
        claimedByUserId: userId,
        updatedAt: new Date(),
      })
      .where(eq(suppliers.id, supplierId))
      .returning(),
  )

  if (error) throw ERROR.DATABASE_ERROR('Failed to update supplier ownership')
  if (rows.length === 0) {
    throw ERROR.DATABASE_ERROR('Failed to update supplier ownership')
  }

  return rows[0]
}
