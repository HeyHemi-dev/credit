import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import type {
  SupplierClaim,
  SupplierClaimSearchResult,
} from '@/lib/types/front-end'
import type { SupplierClaimRow } from '@/db/queries/supplier-claims'
import type { SupplierRow } from '@/db/queries/suppliers'
import {
  claimSupplierSchema,
  emptyInputSchema,
  searchSuppliersSchema,
} from '@/lib/types/validation-schema'

const requireValidatedSessionServer = createServerOnlyFn(async () => {
  const { requireValidatedSession } = await import('@/db/queries/auth')
  return await requireValidatedSession()
})

const getCurrentSupplierClaimServer = createServerOnlyFn(async (userId: string) => {
  const { getCurrentSupplierClaim } = await import(
    '@/lib/server/supplier-claim-state'
  )
  return await getCurrentSupplierClaim(userId)
})

const searchSuppliersForClaimServer = createServerOnlyFn(
  async (query: string, userId: string) => {
    const { searchSuppliersForClaim } = await import(
      '@/db/queries/supplier-claims'
    )
    return await searchSuppliersForClaim(query, userId)
  },
)

const mapSupplierToClientServer = createServerOnlyFn(
  async (supplier: SupplierRow) => {
    const { mapSupplierToClient } = await import(
      '@/lib/server/supplier-claim-state'
    )
    return mapSupplierToClient(supplier)
  },
)

const sendSupplierClaimVerificationCodeServer = createServerOnlyFn(
  async (userId: string, supplierName: string, supplierEmail: string) => {
    const { sendSupplierClaimVerificationCode } = await import(
      '@/lib/server/supplier-claim-verifications'
    )
    return await sendSupplierClaimVerificationCode(
      userId,
      supplierName,
      supplierEmail,
    )
  },
)

const createOrUpdateSupplierClaimServer = createServerOnlyFn(
  async (supplierId: string, userId: string, userEmail: string) => {
    const {
      approveSupplierClaim,
      claimSupplierForUser,
      createSupplierClaim,
      getSupplierById,
      getSupplierClaimByUserId,
      getSupplierClaimRowBySupplierId,
      getSupplierOwnedByUserId,
    } = await import('@/db/queries/supplier-claims')
    const { consumeSupplierClaimVerification } = await import(
      '@/db/queries/supplier-claim-verifications'
    )
    const { ERROR } = await import('@/lib/errors')
    const { mapSupplierToClient } = await import(
      '@/lib/server/supplier-claim-state'
    )

    const [
      ownedSupplier,
      supplier,
      existingClaimForSupplier,
      existingClaimForUser,
    ] = await Promise.all([
      getSupplierOwnedByUserId(userId),
      getSupplierById(supplierId),
      getSupplierClaimRowBySupplierId(supplierId),
      getSupplierClaimByUserId(userId),
    ])

    if (ownedSupplier) {
      if (ownedSupplier.id === supplierId) {
        throw ERROR.INVALID_STATE('You already own this supplier profile')
      }

      throw ERROR.RESOURCE_CONFLICT(
        'You already have a claimed supplier profile',
      )
    }

    if (!supplier) throw ERROR.RESOURCE_NOT_FOUND('Supplier not found')

    if (supplier.claimedByUserId && supplier.claimedByUserId !== userId) {
      throw ERROR.RESOURCE_CONFLICT('This supplier has already been claimed')
    }

    if (
      existingClaimForSupplier &&
      existingClaimForSupplier.userId !== userId
    ) {
      throw ERROR.RESOURCE_CONFLICT(
        'This supplier already has a pending claim request',
      )
    }

    const nextClaim =
      existingClaimForUser === null
        ? await createSupplierClaim(supplierId, userId)
        : await saveSupplierClaim(existingClaimForUser.claim, supplierId)

    if (userEmail.trim().toLowerCase() !== supplier.email.trim().toLowerCase()) {
      let verificationLastSentAt: string | null = null

      if (
        existingClaimForUser?.claim.supplierId === supplierId &&
        existingClaimForUser.claim.status === 'pending'
      ) {
        verificationLastSentAt =
          existingClaimForUser.verification?.lastSentAt.toISOString() ?? null
      }

      return {
        supplier: mapSupplierToClient(supplier),
        status: 'pending' as const,
        verification: {
          email: supplier.email,
          lastSentAt: verificationLastSentAt,
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
      status: 'claimed' as const,
      verification: null,
    }
  },
)

const cancelPendingSupplierClaimServer = createServerOnlyFn(
  async (userId: string) => {
    const {
      deleteSupplierClaim,
      getSupplierClaimByUserId,
    } = await import('@/db/queries/supplier-claims')
    const { deleteSupplierClaimVerificationByClaimId } = await import(
      '@/db/queries/supplier-claim-verifications'
    )
    const { ERROR } = await import('@/lib/errors')

    const claim = await getSupplierClaimByUserId(userId)
    if (!claim || claim.claim.status !== 'pending') {
      throw ERROR.INVALID_STATE('No pending supplier claim was found')
    }

    await deleteSupplierClaimVerificationByClaimId(claim.claim.id)
    await deleteSupplierClaim(claim.claim.id)
  },
)

export const getMySupplierClaimFn = createServerFn({ method: 'GET' })
  .inputValidator(emptyInputSchema)
  .handler(async (): Promise<SupplierClaim | null> => {
    const { user } = await requireValidatedSessionServer()
    return await getCurrentSupplierClaimServer(user.id)
  })

export const searchSuppliersToClaimFn = createServerFn({ method: 'GET' })
  .inputValidator(searchSuppliersSchema)
  .handler(async ({ data }): Promise<Array<SupplierClaimSearchResult>> => {
    const { user } = await requireValidatedSessionServer()
    const suppliers = await searchSuppliersForClaimServer(data.query, user.id)

    return await Promise.all(
      suppliers.map(async (row) => ({
        ...(await mapSupplierToClientServer(row.supplier)),
        claimStatus: row.claimStatus,
      })),
    )
  })

export const claimSupplierFn = createServerFn({ method: 'POST' })
  .inputValidator(claimSupplierSchema)
  .handler(async ({ data }): Promise<SupplierClaim> => {
    const { user } = await requireValidatedSessionServer()

    const claim = await createOrUpdateSupplierClaimServer(
      data.supplierId,
      user.id,
      user.email,
    )

    if (claim.status === 'pending') {
      const verification = await sendSupplierClaimVerificationCodeServer(
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

export const cancelPendingSupplierClaimFn = createServerFn({ method: 'POST' })
  .inputValidator(emptyInputSchema)
  .handler(async (): Promise<void> => {
    const { user } = await requireValidatedSessionServer()
    await cancelPendingSupplierClaimServer(user.id)
  })

export async function createOrUpdateSupplierClaim(
  supplierId: string,
  userId: string,
  userEmail: string,
): Promise<SupplierClaim> {
  return await createOrUpdateSupplierClaimServer(supplierId, userId, userEmail)
}

export async function cancelPendingSupplierClaim(userId: string) {
  await cancelPendingSupplierClaimServer(userId)
}

async function saveSupplierClaim(
  existingClaim: SupplierClaimRow,
  supplierId: string,
) {
  const { deleteSupplierClaimVerificationByClaimId } = await import(
    '@/db/queries/supplier-claim-verifications'
  )
  const { resetSupplierClaim } = await import('@/db/queries/supplier-claims')
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
