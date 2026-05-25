import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import type {
  SupplierClaim,
  SupplierClaimSearchResult,
} from '@/lib/types/front-end'
import type { SupplierRow } from '@/db/queries/suppliers'
import { SUPPLIER_CLAIM_STATUS } from '@/lib/constants'
import {
  claimSupplierSchema,
  emptyInputSchema,
  searchSuppliersSchema,
} from '@/lib/types/validation-schema'

const requireValidatedSessionServer = createServerOnlyFn(async () => {
  const { requireValidatedSession } = await import('@/db/queries/auth')
  return await requireValidatedSession()
})

const getCurrentSupplierClaimServer = createServerOnlyFn(
  async (userId: string) => {
    const { getCurrentSupplierClaim } =
      await import('@/lib/server/supplier-claim-state')
    return await getCurrentSupplierClaim(userId)
  },
)

const searchSuppliersForClaimServer = createServerOnlyFn(
  async (query: string, userId: string) => {
    const { searchSuppliersForClaim } =
      await import('@/db/queries/supplier-claims')
    return await searchSuppliersForClaim(query, userId)
  },
)

const mapSupplierToClientServer = createServerOnlyFn(
  async (supplier: SupplierRow) => {
    const { mapSupplierToClient } =
      await import('@/lib/server/supplier-claim-state')
    return mapSupplierToClient(supplier)
  },
)

const sendSupplierClaimVerificationCodeServer = createServerOnlyFn(
  async (userId: string, supplierName: string, supplierEmail: string) => {
    const { sendSupplierClaimVerificationCode } =
      await import('@/lib/server/supplier-claim-verifications')
    return await sendSupplierClaimVerificationCode(
      userId,
      supplierName,
      supplierEmail,
    )
  },
)

export const createOrUpdateSupplierClaimServer = createServerOnlyFn(
  async (supplierId: string, userId: string, userEmail: string) => {
    const {
      approveSupplierClaim,
      createSupplierClaim,
      getSupplierById,
      getSupplierClaimByUserId,
      getSupplierClaimRowBySupplierId,
    } = await import('@/db/queries/supplier-claims')
    const { consumeSupplierClaimVerification } =
      await import('@/db/queries/supplier-claim-verifications')
    const { ERROR } = await import('@/lib/errors')
    const { mapSupplierToClient } =
      await import('@/lib/server/supplier-claim-state')

    const [supplier, existingClaimForSupplier, existingClaimForUser] =
      await Promise.all([
        getSupplierById(supplierId),
        getSupplierClaimRowBySupplierId(supplierId),
        getSupplierClaimByUserId(userId),
      ])

    if (!supplier) throw ERROR.RESOURCE_NOT_FOUND('Supplier not found')

    if (existingClaimForUser) {
      if (
        existingClaimForUser.claim.status === SUPPLIER_CLAIM_STATUS.APPROVED &&
        existingClaimForUser.claim.supplierId === supplierId
      ) {
        throw ERROR.INVALID_STATE('You already own this supplier profile')
      }

      if (
        existingClaimForUser.claim.status === SUPPLIER_CLAIM_STATUS.APPROVED
      ) {
        throw ERROR.RESOURCE_CONFLICT(
          'You already have a claimed supplier profile',
        )
      }

      if (existingClaimForUser.claim.supplierId !== supplierId) {
        throw ERROR.RESOURCE_CONFLICT(
          'Cancel your current supplier claim before starting another one',
        )
      }
    }

    if (
      existingClaimForSupplier &&
      existingClaimForSupplier.userId !== userId
    ) {
      if (existingClaimForSupplier.status === SUPPLIER_CLAIM_STATUS.APPROVED) {
        throw ERROR.RESOURCE_CONFLICT('This supplier has already been claimed')
      }

      throw ERROR.RESOURCE_CONFLICT(
        'This supplier already has a pending claim request',
      )
    }

    const nextClaim =
      existingClaimForUser?.claim.supplierId === supplierId
        ? existingClaimForUser.claim
        : await createSupplierClaim(supplierId, userId)

    if (
      userEmail.trim().toLowerCase() !== supplier.email.trim().toLowerCase()
    ) {
      let verificationLastSentAt: string | null = null

      if (
        existingClaimForUser?.claim.supplierId === supplierId &&
        existingClaimForUser.claim.status === SUPPLIER_CLAIM_STATUS.PENDING
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

    await approveSupplierClaim(nextClaim.id)
    if (
      existingClaimForUser?.claim.id === nextClaim.id &&
      existingClaimForUser.verification
    ) {
      await consumeSupplierClaimVerification(
        existingClaimForUser.verification.id,
      )
    }

    return {
      supplier: mapSupplierToClient(supplier),
      status: 'claimed' as const,
      verification: null,
    }
  },
)

export const archiveSupplierClaimServer = createServerOnlyFn(
  async (userId: string) => {
    const { archiveSupplierClaim, getSupplierClaimByUserId } =
      await import('@/db/queries/supplier-claims')
    const { ERROR } = await import('@/lib/errors')

    const claim = await getSupplierClaimByUserId(userId)
    if (!claim) throw ERROR.INVALID_STATE('No active supplier claim was found')

    await archiveSupplierClaim(claim.claim.id)
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

export const archiveSupplierClaimFn = createServerFn({ method: 'POST' })
  .inputValidator(emptyInputSchema)
  .handler(async (): Promise<void> => {
    const { user } = await requireValidatedSessionServer()
    await archiveSupplierClaimServer(user.id)
  })
