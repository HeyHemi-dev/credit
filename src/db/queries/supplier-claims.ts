import { and, eq, ilike, or } from 'drizzle-orm'
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
    // TODO: replace .then
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
  userEmail: string,
) {
  const ownedSupplier = await getSupplierOwnedByUserId(userId)
  if (ownedSupplier) {
    if (ownedSupplier.id === supplierId) {
      throw ERROR.INVALID_STATE('You already own this supplier profile')
    }

    throw ERROR.RESOURCE_CONFLICT('You already have a claimed supplier profile')
  }

  const supplier = await getSupplierById(supplierId)
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
    throw ERROR.RESOURCE_CONFLICT(
      'This supplier already has a pending claim request',
    )
  }

  const [existingClaimForUser] = await db
    .select()
    .from(supplierClaims)
    .where(eq(supplierClaims.userId, userId))
    .limit(1)

  const nextClaim =
    existingClaimForUser === undefined
      ? await insertSupplierClaim(supplierId, userId)
      : await updateSupplierClaim(existingClaimForUser, supplierId)

  if (userEmail.trim().toLowerCase() !== supplier.email.trim().toLowerCase()) {
    return nextClaim
  }

  await approveSupplierClaim(nextClaim.id, userId)
  const approvedClaim = await getSupplierClaimByUserId(userId)
  if (!approvedClaim) {
    throw ERROR.DATABASE_ERROR('Supplier claim was not found after approval')
  }

  return approvedClaim.claim
}

// TODO: rename to upsert
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
    throw ERROR.INVALID_STATE(
      'Too many incorrect attempts. Request a new code.',
    )
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
      throw ERROR.INVALID_STATE(
        'Too many incorrect attempts. Request a new code.',
      )
    }

    throw ERROR.VALIDATION_ERROR('Incorrect code. Try again.')
  }

  await approveSupplierClaim(claim.claim.id, userId)
}

async function getSupplierById(supplierId: string) {
  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, supplierId))
    .limit(1)

  return supplier ?? null
}

async function getPendingSupplierClaimByUserId(userId: string) {
  const claim = await getSupplierClaimByUserId(userId)
  if (!claim) return null
  if (claim.claim.status !== 'pending') return null
  return claim
}

async function insertSupplierClaim(supplierId: string, userId: string) {
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
  if (rows.length === 0)
    throw ERROR.DATABASE_ERROR('Failed to create supplier claim')
  return rows[0]
}

async function updateSupplierClaim(
  existingClaimForUser: SupplierClaimRow,
  supplierId: string,
) {
  if (
    existingClaimForUser.supplierId !== supplierId ||
    existingClaimForUser.status !== 'pending'
  ) {
    await deleteSupplierClaimVerification(existingClaimForUser.id)
  }

  if (
    existingClaimForUser.supplierId === supplierId &&
    existingClaimForUser.status === 'pending'
  ) {
    return existingClaimForUser
  }

  const { data: rows, error } = await tryCatch(
    db
      .update(supplierClaims)
      .set({
        supplierId,
        status: 'pending',
        updatedAt: new Date(),
      })
      .where(eq(supplierClaims.userId, existingClaimForUser.userId))
      .returning(),
  )

  if (error) throw ERROR.DATABASE_ERROR('Failed to update supplier claim')
  if (rows.length === 0)
    throw ERROR.DATABASE_ERROR('Failed to update supplier claim')
  return rows[0]
}

async function deleteSupplierClaimVerification(supplierClaimId: string) {
  const { error } = await tryCatch(
    db
      .delete(supplierClaimVerifications)
      .where(eq(supplierClaimVerifications.supplierClaimId, supplierClaimId)),
  )

  if (error)
    throw ERROR.DATABASE_ERROR('Failed to reset supplier claim verification')
}

async function approveSupplierClaim(claimId: string, userId: string) {
  const [claim] = await db
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
      and(eq(supplierClaims.id, claimId), eq(supplierClaims.userId, userId)),
    )
    .limit(1)

  if (!claim) throw ERROR.RESOURCE_NOT_FOUND('Supplier claim not found')
  if (
    claim.supplier.claimedByUserId &&
    claim.supplier.claimedByUserId !== userId
  ) {
    throw ERROR.RESOURCE_CONFLICT('This supplier has already been claimed')
  }

  const now = new Date()
  const { data: supplierRows, error: supplierError } = await tryCatch(
    db
      .update(suppliers)
      .set({
        claimedByUserId: userId,
        updatedAt: now,
      })
      .where(eq(suppliers.id, claim.supplier.id))
      .returning(),
  )

  if (supplierError)
    throw ERROR.DATABASE_ERROR('Failed to update supplier ownership')
  if (supplierRows.length === 0) {
    throw ERROR.DATABASE_ERROR('Failed to update supplier ownership')
  }

  const { data: claimRows, error: claimError } = await tryCatch(
    db
      .update(supplierClaims)
      .set({
        status: 'approved',
        updatedAt: now,
      })
      .where(eq(supplierClaims.id, claim.claim.id))
      .returning(),
  )

  if (claimError) throw ERROR.DATABASE_ERROR('Failed to approve supplier claim')
  if (claimRows.length === 0)
    throw ERROR.DATABASE_ERROR('Failed to approve supplier claim')

  if (!claim.verification) return

  const { data: verificationRows, error: verificationError } = await tryCatch(
    db
      .update(supplierClaimVerifications)
      .set({
        consumedAt: now,
        updatedAt: now,
      })
      .where(eq(supplierClaimVerifications.id, claim.verification.id))
      .returning(),
  )

  if (verificationError) {
    throw ERROR.DATABASE_ERROR('Failed to complete supplier claim verification')
  }

  if (verificationRows.length === 0) {
    throw ERROR.DATABASE_ERROR('Failed to complete supplier claim verification')
  }
}
