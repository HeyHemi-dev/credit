import { and, eq, ilike, inArray, or } from 'drizzle-orm'
import type { SupplierClaimSearchResult } from '@/lib/types/front-end'
import { db } from '@/db/connection'
import { supplierClaimVerifications, supplierClaims, suppliers } from '@/db/schema'
import {
  ACTIVE_SUPPLIER_CLAIM_STATUSES,
  SUPPLIER_CLAIM_STATUS,
} from '@/lib/constants'
import { ERROR } from '@/lib/errors'
import { normalizeHandle } from '@/lib/formatters'
import { tryCatch } from '@/lib/try-catch'

export type SupplierClaimRow = typeof supplierClaims.$inferSelect

type SupplierClaimSearchRow = {
  supplier: typeof suppliers.$inferSelect
  claimStatus: SupplierClaimSearchResult['claimStatus']
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
    .where(
      and(
        eq(supplierClaims.userId, userId),
        inArray(supplierClaims.status, ACTIVE_SUPPLIER_CLAIM_STATUSES),
      ),
    )
    .limit(1)

  return row ?? null
}

export async function getSupplierClaimRowBySupplierId(supplierId: string) {
  const [row] = await db
    .select()
    .from(supplierClaims)
    .where(
      and(
        eq(supplierClaims.supplierId, supplierId),
        inArray(supplierClaims.status, ACTIVE_SUPPLIER_CLAIM_STATUSES),
      ),
    )
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
    .leftJoin(
      supplierClaims,
      and(
        eq(supplierClaims.supplierId, suppliers.id),
        inArray(supplierClaims.status, ACTIVE_SUPPLIER_CLAIM_STATUSES),
      ),
    )
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

    if (
      row.claim?.status === SUPPLIER_CLAIM_STATUS.APPROVED &&
      row.claim.userId === userId
    ) {
      claimStatus = 'claimedByYou'
    } else if (row.claim?.status === SUPPLIER_CLAIM_STATUS.APPROVED) {
      claimStatus = 'claimed'
    } else if (
      row.claim?.status === SUPPLIER_CLAIM_STATUS.PENDING &&
      row.claim.userId !== userId
    ) {
      claimStatus = 'pending'
    }

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
        status: SUPPLIER_CLAIM_STATUS.PENDING,
      })
      .returning(),
  )

  if (error) throw ERROR.DATABASE_ERROR('Failed to create supplier claim')
  if (rows.length === 0) throw ERROR.DATABASE_ERROR('Failed to create supplier claim')
  return rows[0]
}

export async function archiveSupplierClaim(claimId: string) {
  const { data: rows, error } = await tryCatch(
    db
      .update(supplierClaims)
      .set({
        status: SUPPLIER_CLAIM_STATUS.ARCHIVED,
        updatedAt: new Date(),
      })
      .where(eq(supplierClaims.id, claimId))
      .returning(),
  )

  if (error) throw ERROR.DATABASE_ERROR('Failed to archive supplier claim')
  if (rows.length === 0) throw ERROR.DATABASE_ERROR('Failed to archive supplier claim')
  return rows[0]
}

export async function approveSupplierClaim(claimId: string) {
  const { data: rows, error } = await tryCatch(
    db
      .update(supplierClaims)
      .set({
        status: SUPPLIER_CLAIM_STATUS.APPROVED,
        updatedAt: new Date(),
      })
      .where(eq(supplierClaims.id, claimId))
      .returning(),
  )

  if (error) throw ERROR.DATABASE_ERROR('Failed to approve supplier claim')
  if (rows.length === 0) throw ERROR.DATABASE_ERROR('Failed to approve supplier claim')
  return rows[0]
}
