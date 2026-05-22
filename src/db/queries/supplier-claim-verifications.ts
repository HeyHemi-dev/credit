import { eq } from 'drizzle-orm'
import { db } from '@/db/connection'
import { getSupplierClaimByUserId } from '@/db/queries/supplier-claims'
import { supplierClaimVerifications } from '@/db/schema'
import { ERROR } from '@/lib/errors'
import { tryCatch } from '@/lib/try-catch'

const SUPPLIER_CLAIM_VERIFICATION_MAX_ATTEMPTS = 5

export type SupplierClaimVerificationRow =
  typeof supplierClaimVerifications.$inferSelect

export async function deleteSupplierClaimVerificationByClaimId(
  supplierClaimId: string,
) {
  const { error } = await tryCatch(
    db
      .delete(supplierClaimVerifications)
      .where(eq(supplierClaimVerifications.supplierClaimId, supplierClaimId)),
  )

  if (error)
    throw ERROR.DATABASE_ERROR('Failed to reset supplier claim verification')
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

export async function createSupplierClaimVerification(
  supplierClaimId: string,
  codeHash: string,
  expiresAt: Date,
) {
  const now = new Date()
  const { data: rows, error } = await tryCatch(
    db
      .insert(supplierClaimVerifications)
      .values({
        supplierClaimId,
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

export async function refreshSupplierClaimVerification(
  verificationId: string,
  codeHash: string,
  expiresAt: Date,
) {
  const now = new Date()
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
      .where(eq(supplierClaimVerifications.id, verificationId))
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

  return claim
}

async function getPendingSupplierClaimByUserId(userId: string) {
  const claim = await getSupplierClaimByUserId(userId)
  if (!claim) return null
  if (claim.claim.status !== 'pending') return null
  return claim
}
