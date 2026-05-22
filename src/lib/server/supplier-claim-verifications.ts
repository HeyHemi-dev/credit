import { createHash } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import {
  approveSupplierClaim,
  claimSupplierForUser,
  getSupplierClaimByUserId,
} from '@/db/queries/supplier-claims'
import {
  consumeSupplierClaimVerification,
  createSupplierClaimVerification,
  refreshSupplierClaimVerification,
  verifySupplierClaimCode,
} from '@/db/queries/supplier-claim-verifications'
import { requireValidatedSession } from '@/db/queries/auth'
import {
  SUPPLIER_CLAIM_CODE_EXPIRY_MS,
  SUPPLIER_CLAIM_VERIFICATION_COOLDOWN_MS,
} from '@/lib/constants'
import { ERROR } from '@/lib/errors'
import { generateToken } from '@/lib/generate-token'
import {
  mapSupplierToClient,
  requireCurrentSupplierClaim,
} from '@/lib/server/supplier-claim-state'
import { sendSupplierClaimVerificationEmail } from '@/emails/supplier-claim-verification-email'
import {
  emptyInputSchema,
  verifySupplierClaimCodeSchema,
} from '@/lib/types/validation-schema'

export const sendSupplierClaimVerificationCodeFn = createServerFn({
  method: 'POST',
})
  .inputValidator(emptyInputSchema)
  .handler(async () => {
    const { user } = await requireValidatedSession()
    const claim = await requireCurrentSupplierClaim(user.id)
    if (claim.status !== 'pending') {
      throw ERROR.INVALID_STATE(
        'This supplier claim no longer needs email verification',
      )
    }

    await sendSupplierClaimVerificationCode(
      user.id,
      claim.supplier.name,
      claim.supplier.email,
    )

    return await requireCurrentSupplierClaim(user.id)
  })

export const verifySupplierClaimCodeFn = createServerFn({ method: 'POST' })
  .inputValidator(verifySupplierClaimCodeSchema)
  .handler(async ({ data }) => {
    const { user } = await requireValidatedSession()

    const claim = await verifySupplierClaimCode(
      user.id,
      hashSupplierClaimVerificationCode(user.id, data.code),
    )

    await claimSupplierForUser(claim.supplier.id, user.id)
    await approveSupplierClaim(claim.claim.id)
    if (claim.verification) {
      await consumeSupplierClaimVerification(claim.verification.id)
    }

    return {
      supplier: mapSupplierToClient(claim.supplier),
      status: 'claimed' as const,
      verification: null,
    }
  })

export async function sendSupplierClaimVerificationCode(
  userId: string,
  supplierName: string,
  supplierEmail: string,
) {
  const code = generateToken(6)
  const expiresAt = new Date(Date.now() + SUPPLIER_CLAIM_CODE_EXPIRY_MS)

  const verification = await createOrRefreshSupplierClaimVerification(
    userId,
    hashSupplierClaimVerificationCode(userId, code),
    expiresAt,
  )

  await sendSupplierClaimVerificationEmail({
    code,
    supplierEmail,
    supplierName,
  })

  return verification
}

export async function createOrRefreshSupplierClaimVerification(
  userId: string,
  codeHash: string,
  expiresAt: Date,
) {
  const claim = await getSupplierClaimByUserId(userId)
  if (!claim || claim.claim.status !== 'pending') {
    throw ERROR.INVALID_STATE('Start a supplier claim before requesting a code')
  }

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
    return await createSupplierClaimVerification(
      claim.claim.id,
      codeHash,
      expiresAt,
    )
  }

  return await refreshSupplierClaimVerification(
    claim.verification.id,
    codeHash,
    expiresAt,
  )
}

function hashSupplierClaimVerificationCode(userId: string, code: string) {
  return createHash('sha256').update(`${userId}:${code}`).digest('hex')
}
