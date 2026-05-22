import { createServerFn } from '@tanstack/react-start'
import type {
  SupplierClaim,
  SupplierClaimSearchResult,
} from '@/lib/types/front-end'
import type { SupplierClaimRow } from '@/db/queries/supplier-claims'
import { requireValidatedSession } from '@/db/queries/auth'
import {
  approveSupplierClaim,
  claimSupplierForUser,
  createSupplierClaim,
  getSupplierById,
  getSupplierClaimByUserId,
  getSupplierClaimRowBySupplierId,
  getSupplierOwnedByUserId,
  resetSupplierClaim,
  searchSuppliersForClaim,
} from '@/db/queries/supplier-claims'
import {
  consumeSupplierClaimVerification,
  deleteSupplierClaimVerificationByClaimId,
} from '@/db/queries/supplier-claim-verifications'
import { ERROR } from '@/lib/errors'
import {
  getCurrentSupplierClaim,
  mapSupplierToClient,
} from '@/lib/server/supplier-claim-state'
import { sendSupplierClaimVerificationCode } from '@/lib/server/supplier-claim-verifications'
import {
  claimSupplierSchema,
  emptyInputSchema,
  searchSuppliersSchema,
} from '@/lib/types/validation-schema'

export const getMySupplierClaimFn = createServerFn({ method: 'GET' })
  .inputValidator(emptyInputSchema)
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

    const claim = await createOrUpdateSupplierClaim(
      data.supplierId,
      user.id,
      user.email,
    )

    if (claim.status === 'pending') {
      const verification = await sendSupplierClaimVerificationCode(
        user.id,
        claim.supplier.name,
        claim.supplier.email,
      )

      return {
        ...claim,
        verification: {
          email: claim.supplier.email,
          lastSentAt: verification.lastSentAt.toISOString(),
        },
      }
    }

    return claim
  })

// TODO: refactor if some db queries can run concurrently
export async function createOrUpdateSupplierClaim(
  supplierId: string,
  userId: string,
  userEmail: string,
): Promise<SupplierClaim> {
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

  const existingClaimForSupplier =
    await getSupplierClaimRowBySupplierId(supplierId)
  if (existingClaimForSupplier && existingClaimForSupplier.userId !== userId) {
    throw ERROR.RESOURCE_CONFLICT(
      'This supplier already has a pending claim request',
    )
  }

  const existingClaimForUser = await getSupplierClaimByUserId(userId)
  const nextClaim =
    existingClaimForUser === null
      ? await createSupplierClaim(supplierId, userId)
      : await saveSupplierClaim(existingClaimForUser.claim, supplierId)

  if (userEmail.trim().toLowerCase() !== supplier.email.trim().toLowerCase()) {
    // TODO: replace ternery
    return {
      supplier: mapSupplierToClient(supplier),
      status: 'pending',
      verification:
        existingClaimForUser?.claim.supplierId === supplierId &&
        existingClaimForUser.claim.status === 'pending'
          ? {
              email: supplier.email,
              lastSentAt:
                existingClaimForUser.verification?.lastSentAt.toISOString() ??
                null,
            }
          : {
              email: supplier.email,
              lastSentAt: null,
            },
    }
  }

  await claimSupplierForUser(supplier.id, userId)
  await approveSupplierClaim(nextClaim.id)
  if (
    existingClaimForUser?.claim.id === nextClaim.id &&
    existingClaimForUser.verification
  ) {
    await consumeSupplierClaimVerification(existingClaimForUser.verification.id)
  }

  return {
    supplier: mapSupplierToClient(supplier),
    status: 'claimed',
    verification: null,
  }
}

async function saveSupplierClaim(
  existingClaim: SupplierClaimRow,
  supplierId: string,
) {
  if (
    existingClaim.supplierId !== supplierId ||
    existingClaim.status !== 'pending'
  ) {
    await deleteSupplierClaimVerificationByClaimId(existingClaim.id)
  }

  if (
    existingClaim.supplierId === supplierId &&
    existingClaim.status === 'pending'
  ) {
    return existingClaim
  }

  return await resetSupplierClaim(existingClaim.id, supplierId)
}
