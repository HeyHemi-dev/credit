import { createHash } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import type {
  Supplier,
  SupplierClaim,
  SupplierClaimSearchResult,
  SupplierClaimStatus,
} from '@/lib/types/front-end'
import type { SupplierRow } from '@/db/queries/suppliers'
import { requireValidatedSession } from '@/db/queries/auth'
import {
  createOrRefreshSupplierClaimVerification,
  createOrUpdateSupplierClaim,
  getSupplierClaimByUserId,
  getSupplierOwnedByUserId,
  searchSuppliersForClaim,
  verifySupplierClaimCode,
} from '@/db/queries/supplier-claims'
import { ERROR } from '@/lib/errors'
import { generateToken } from '@/lib/generate-token'
import {
  TRANSACTIONAL_EMAIL_FROM,
  sendTransactionalEmail,
} from '@/lib/server/email'
import {
  claimSupplierSchema,
  searchSuppliersSchema,
  verifySupplierClaimCodeSchema,
} from '@/lib/types/validation-schema'

// TODO: consider if we need an empty schema input validation?
const emptySchema = z.object({})
const SUPPLIER_CLAIM_CODE_EXPIRY_MS = 10 * 60 * 1000

// TODO: separate out supplier claim verfication from supplier claim. Move to new files

export const getMySupplierClaimFn = createServerFn({ method: 'GET' })
  .inputValidator(emptySchema)
  .handler(async (): Promise<SupplierClaim | null> => {
    const { user } = await requireValidatedSession()
    return await getCurrentSupplierClaim(user.id)
  })

export const searchSuppliersToClaimFn = createServerFn({ method: 'GET' })
  .inputValidator(searchSuppliersSchema)
  .handler(async ({ data }): Promise<Array<SupplierClaimSearchResult>> => {
    const { user } = await requireValidatedSession()

    const suppliers = await searchSuppliersForClaim(data.query, user.id)
    return suppliers.map((row) => ({
      ...mapSupplierToClient(row.supplier),
      claimStatus: row.claimStatus,
    }))
  })

export const claimSupplierFn = createServerFn({ method: 'POST' })
  .inputValidator(claimSupplierSchema)
  .handler(async ({ data }): Promise<SupplierClaim> => {
    const { user } = await requireValidatedSession()

    // TODO: can't we just return the claim right away? do we need a roundtrip to get again?
    await createOrUpdateSupplierClaim(data.supplierId, user.id, user.email)

    const claim = await getCurrentSupplierClaim(user.id)
    if (!claim)
      throw ERROR.DATABASE_ERROR('Supplier claim was not found after saving')

    if (claim.status === 'pending') {
      await sendSupplierClaimVerificationCode(
        user.id,
        claim.supplier.name,
        claim.supplier.email,
      )
      return await getRequiredCurrentSupplierClaim(user.id)
    }

    return claim
  })

export const sendSupplierClaimVerificationCodeFn = createServerFn({
  method: 'POST',
})
  .inputValidator(emptySchema)
  .handler(async (): Promise<SupplierClaim> => {
    const { user } = await requireValidatedSession()
    const claim = await getRequiredCurrentSupplierClaim(user.id)
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
    return await getRequiredCurrentSupplierClaim(user.id)
  })

export const verifySupplierClaimCodeFn = createServerFn({ method: 'POST' })
  .inputValidator(verifySupplierClaimCodeSchema)
  .handler(async ({ data }): Promise<SupplierClaim> => {
    const { user } = await requireValidatedSession()

    await verifySupplierClaimCode(
      user.id,
      hashSupplierClaimVerificationCode(user.id, data.code),
    )
    return await getRequiredCurrentSupplierClaim(user.id)
  })

async function getCurrentSupplierClaim(
  userId: string,
): Promise<SupplierClaim | null> {
  const ownedSupplier = await getSupplierOwnedByUserId(userId)
  if (ownedSupplier) {
    return {
      supplier: mapSupplierToClient(ownedSupplier),
      status: 'claimed',
      verification: null,
    }
  }

  const claim = await getSupplierClaimByUserId(userId)
  if (!claim) return null

  return {
    supplier: mapSupplierToClient(claim.supplier),
    status: mapClaimStatus(claim.claim.status),
    verification:
      claim.claim.status !== 'pending'
        ? null
        : {
            email: claim.supplier.email,
            lastSentAt: claim.verification?.lastSentAt.toISOString() ?? null,
          },
  }
}

// rename to requireSupplierClaim
async function getRequiredCurrentSupplierClaim(userId: string) {
  const claim = await getCurrentSupplierClaim(userId)
  if (!claim) throw ERROR.DATABASE_ERROR('Supplier claim was not found')
  return claim
}

// TODO: move to an emails file, this should be treated as one layer deeper, similar to how queries are one layer deeper.
async function sendSupplierClaimVerificationCode(
  userId: string,
  supplierName: string,
  supplierEmail: string,
) {
  const code = generateToken(6)
  const expiresAt = new Date(Date.now() + SUPPLIER_CLAIM_CODE_EXPIRY_MS)

  await createOrRefreshSupplierClaimVerification(
    userId,
    hashSupplierClaimVerificationCode(userId, code),
    expiresAt,
  )

  // TODO: improve email copy
  await sendTransactionalEmail({
    from: TRANSACTIONAL_EMAIL_FROM,
    to: supplierEmail,
    subject: `Verify your ${supplierName} supplier claim`,
    text: [
      `Your With Thanks supplier claim code is ${code}.`,
      'Enter this 6-character code in account settings to verify your claim.',
      'This code expires in 10 minutes.',
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n'),
    html: [
      `<p>Your With Thanks supplier claim code is <strong>${code}</strong>.</p>`,
      '<p>Enter this 6-character code in account settings to verify your claim.</p>',
      '<p>This code expires in 10 minutes.</p>',
      '<p>If you did not request this, you can ignore this email.</p>',
    ].join(''),
  })
}

function hashSupplierClaimVerificationCode(userId: string, code: string) {
  return createHash('sha256').update(`${userId}:${code}`).digest('hex')
}

function mapClaimStatus(status: string): SupplierClaimStatus {
  if (status === 'approved') return 'approved'
  if (status === 'rejected') return 'rejected'
  return 'pending'
}

function mapSupplierToClient(supplier: SupplierRow): Supplier {
  return {
    id: supplier.id,
    name: supplier.name,
    email: supplier.email,
    region: supplier.region,
    instagramHandle: supplier.instagramHandle,
    tiktokHandle: supplier.tiktokHandle,
  }
}
