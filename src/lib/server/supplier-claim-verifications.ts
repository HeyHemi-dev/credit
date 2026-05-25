import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import {
  SUPPLIER_CLAIM_CODE_EXPIRY_MS,
  SUPPLIER_CLAIM_VERIFICATION_COOLDOWN_MS,
} from '@/lib/constants'
import {
  emptyInputSchema,
  verifySupplierClaimCodeSchema,
} from '@/lib/types/validation-schema'

const requireValidatedSessionServer = createServerOnlyFn(async () => {
  const { requireValidatedSession } = await import('@/db/queries/auth')
  return await requireValidatedSession()
})

const requireCurrentSupplierClaimServer = createServerOnlyFn(
  async (userId: string) => {
    const { requireCurrentSupplierClaim } = await import(
      '@/lib/server/supplier-claim-state'
    )
    return await requireCurrentSupplierClaim(userId)
  },
)

const sendSupplierClaimVerificationEmailServer = createServerOnlyFn(
  async (input: {
    code: string
    supplierEmail: string
    supplierName: string
  }) => {
    const { sendSupplierClaimVerificationEmail } = await import(
      '@/emails/supplier-claim-verification-email'
    )
    return await sendSupplierClaimVerificationEmail(input)
  },
)

const hashSupplierClaimVerificationCodeServer = createServerOnlyFn(
  async (userId: string, code: string) => {
    const { createHash } = await import('node:crypto')
    return createHash('sha256').update(`${userId}:${code}`).digest('hex')
  },
)

const createOrRefreshSupplierClaimVerificationServer = createServerOnlyFn(
  async (userId: string, codeHash: string, expiresAt: Date) => {
    const { getSupplierClaimByUserId } = await import(
      '@/db/queries/supplier-claims'
    )
    const {
      createSupplierClaimVerification,
      refreshSupplierClaimVerification,
    } = await import('@/db/queries/supplier-claim-verifications')
    const { ERROR } = await import('@/lib/errors')

    const claim = await getSupplierClaimByUserId(userId)
    if (!claim || claim.claim.status !== 'pending') {
      throw ERROR.INVALID_STATE(
        'Start a supplier claim before requesting a code',
      )
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
  },
)

const verifySupplierClaimCodeServer = createServerOnlyFn(
  async (userId: string, codeHash: string) => {
    const { approveSupplierClaim } = await import('@/db/queries/supplier-claims')
    const { consumeSupplierClaimVerification, verifySupplierClaimCode } =
      await import('@/db/queries/supplier-claim-verifications')
    const { mapSupplierToClient } = await import(
      '@/lib/server/supplier-claim-state'
    )

    const claim = await verifySupplierClaimCode(userId, codeHash)

    await approveSupplierClaim(claim.claim.id)
    if (claim.verification) {
      await consumeSupplierClaimVerification(claim.verification.id)
    }

    return {
      supplier: mapSupplierToClient(claim.supplier),
      status: 'claimed' as const,
      verification: null,
    }
  },
)

export const sendSupplierClaimVerificationCodeFn = createServerFn({
  method: 'POST',
})
  .inputValidator(emptyInputSchema)
  .handler(async () => {
    const { ERROR } = await import('@/lib/errors')
    const { user } = await requireValidatedSessionServer()
    const claim = await requireCurrentSupplierClaimServer(user.id)
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

    return await requireCurrentSupplierClaimServer(user.id)
  })

export const verifySupplierClaimCodeFn = createServerFn({ method: 'POST' })
  .inputValidator(verifySupplierClaimCodeSchema)
  .handler(async ({ data }) => {
    const { user } = await requireValidatedSessionServer()
    return await verifySupplierClaimCodeServer(
      user.id,
      await hashSupplierClaimVerificationCodeServer(user.id, data.code),
    )
  })

export async function sendSupplierClaimVerificationCode(
  userId: string,
  supplierName: string,
  supplierEmail: string,
) {
  const { generateToken } = await import('@/lib/generate-token')
  const code = generateToken(6)
  const expiresAt = new Date(Date.now() + SUPPLIER_CLAIM_CODE_EXPIRY_MS)

  const verification = await createOrRefreshSupplierClaimVerificationServer(
    userId,
    await hashSupplierClaimVerificationCodeServer(userId, code),
    expiresAt,
  )

  await sendSupplierClaimVerificationEmailServer({
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
  return await createOrRefreshSupplierClaimVerificationServer(
    userId,
    codeHash,
    expiresAt,
  )
}
