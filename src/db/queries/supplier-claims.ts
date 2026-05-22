import { eq, ilike, or } from 'drizzle-orm'
import type { SupplierClaimSearchResult } from '@/lib/types/front-end'
import { db } from '@/db/connection'
import {
  supplierClaimVerifications,
  supplierClaims,
  suppliers,
} from '@/db/schema'
import { ERROR } from '@/lib/errors'
import { normalizeHandle } from '@/lib/formatters'
import { tryCatch } from '@/lib/try-catch'

const SUPPLIER_CLAIM_VERIFICATION_MAX_ATTEMPTS = 5
const SUPPLIER_CLAIM_VERIFICATION_COOLDOWN_MS = 30_000

// TODO: separate out supplier claim verfication from supplier claim. Move to new file

export type SupplierClaimRow = typeof supplierClaims.$inferSelect
export type SupplierClaimVerificationRow =
  typeof supplierClaimVerifications.$inferSelect
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

export async function getSupplierClaimRowByUserId(userId: string) {
  const [row] = await db
    .select()
    .from(supplierClaims)
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

export async function deleteSupplierClaimVerificationByClaimId(
  supplierClaimId: string,
) {
  const { error } = await tryCatch(
    db
      .delete(supplierClaimVerifications)
      .where(eq(supplierClaimVerifications.supplierClaimId, supplierClaimId)),
  )

  if (error) throw ERROR.DATABASE_ERROR('Failed to reset supplier claim verification')
}

export async function consumeSupplierClaimVerification(verificationId: string) {
  const now = new Date()
  const { data: rows, error } = await tryCatch(
    db
      .update(supplierClaimVerifications)
      .set({
        consumedAt: now,
        updatedAt: now,
      })
      .where(eq(supplierClaimVerifications.id, verificationId))
      .returning(),
  )

  if (error) {
    throw ERROR.DATABASE_ERROR('Failed to complete supplier claim verification')
  }

  if (rows.length === 0) {
    throw ERROR.DATABASE_ERROR('Failed to complete supplier claim verification')
  }

  return rows[0]
}

export async function createOrRefreshSupplierClaimVerification(
  userId: string,
  codeHash: string,
  expiresAt: Date,
) {
  const claim = await getPendingSupplierClaimByUserId(userId)
  if (!claim)
    throw ERROR.INVALID_STATE('Start a supplier claim before requesting a code')
  if (
    claim.supplier.claimedByUserId &&
    claim.supplier.claimedByUserId !== userId
  ) {
    throw ERROR.RESOURCE_CONFLICT('This supplier has already been claimed')
  }

  const now = new Date()
  if (
    claim.verification &&
    now.getTime() - claim.verification.lastSentAt.getTime() <
      SUPPLIER_CLAIM_VERIFICATION_COOLDOWN_MS
  ) {
    throw ERROR.INVALID_STATE(
      'Please wait 30 seconds before requesting a new code',
    )
  }

  if (!claim.verification) {
    const { data: rows, error } = await tryCatch(
      db
        .insert(supplierClaimVerifications)
        .values({
          supplierClaimId: claim.claim.id,
          codeHash,
          expiresAt,
          consumedAt: null,
          attemptCount: 0,
          lastSentAt: now,
        })
        .returning(),
    )

    if (error) {
      throw ERROR.DATABASE_ERROR('Failed to save supplier claim verification')
    }

    if (rows.length === 0) {
      throw ERROR.DATABASE_ERROR('Failed to save supplier claim verification')
    }

    return rows[0]
  }

  const { data: rows, error } = await tryCatch(
    db
      .update(supplierClaimVerifications)
      .set({
        codeHash,
        expiresAt,
        consumedAt: null,
        attemptCount: 0,
        lastSentAt: now,
        updatedAt: now,
      })
      .where(eq(supplierClaimVerifications.id, claim.verification.id))
      .returning(),
  )

  if (error)
    throw ERROR.DATABASE_ERROR('Failed to refresh supplier claim verification')
  if (rows.length === 0) {
    throw ERROR.DATABASE_ERROR('Failed to refresh supplier claim verification')
  }

  return rows[0]
}

export async function verifySupplierClaimCode(
  userId: string,
  codeHash: string,
) {
  const claim = await getPendingSupplierClaimByUserId(userId)
  if (!claim) throw ERROR.INVALID_STATE('No pending supplier claim was found')
  if (!claim.verification) {
    throw ERROR.INVALID_STATE('Request a verification code before trying again')
  }

  if (
    claim.supplier.claimedByUserId &&
    claim.supplier.claimedByUserId !== userId
  ) {
    throw ERROR.RESOURCE_CONFLICT('This supplier has already been claimed')
  }

  const now = new Date()
  if (claim.verification.consumedAt) {
    throw ERROR.INVALID_STATE(
      'This code has already been used. Request a new one.',
    )
  }

  if (claim.verification.expiresAt <= now) {
    throw ERROR.INVALID_STATE('This code has expired. Request a new one.')
  }

  if (
    claim.verification.attemptCount >= SUPPLIER_CLAIM_VERIFICATION_MAX_ATTEMPTS
  ) {
    throw ERROR.INVALID_STATE('Too many incorrect attempts. Request a new code.')
  }

  if (claim.verification.codeHash !== codeHash) {
    const nextAttemptCount = claim.verification.attemptCount + 1
    const { data: rows, error } = await tryCatch(
      db
        .update(supplierClaimVerifications)
        .set({
          attemptCount: nextAttemptCount,
          updatedAt: now,
        })
        .where(eq(supplierClaimVerifications.id, claim.verification.id))
        .returning(),
    )

    if (error) {
      throw ERROR.DATABASE_ERROR(
        'Failed to update supplier claim verification attempt',
      )
    }

    if (rows.length === 0) {
      throw ERROR.DATABASE_ERROR(
        'Failed to update supplier claim verification attempt',
      )
    }

    if (nextAttemptCount >= SUPPLIER_CLAIM_VERIFICATION_MAX_ATTEMPTS) {
      throw ERROR.INVALID_STATE('Too many incorrect attempts. Request a new code.')
    }

    throw ERROR.VALIDATION_ERROR('Incorrect code. Try again.')
  }

  return claim
}

async function getPendingSupplierClaimByUserId(userId: string) {
  const claim = await getSupplierClaimByUserId(userId)
  if (!claim) return null
  if (claim.claim.status !== 'pending') return null
  return claim
}
