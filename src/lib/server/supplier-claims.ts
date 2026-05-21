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
  createOrUpdateSupplierClaim,
  getSupplierClaimByUserId,
  getSupplierOwnedByUserId,
  searchSuppliersForClaim,
} from '@/db/queries/supplier-claims'
import { ERROR } from '@/lib/errors'
import { claimSupplierSchema, searchSuppliersSchema } from '@/lib/types/validation-schema'

const emptySchema = z.object({})

export const getMySupplierClaimFn = createServerFn({ method: 'GET' })
  .inputValidator(emptySchema)
  .handler(async (): Promise<SupplierClaim | null> => {
    const { user } = await requireValidatedSession()

    const ownedSupplier = await getSupplierOwnedByUserId(user.id)
    if (ownedSupplier) {
      return {
        supplier: mapSupplierToClient(ownedSupplier),
        status: 'claimed',
      }
    }

    const claim = await getSupplierClaimByUserId(user.id)
    if (!claim) return null

    return {
      supplier: mapSupplierToClient(claim.supplier),
      status: mapClaimStatus(claim.claim.status),
    }
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

    await createOrUpdateSupplierClaim(data.supplierId, user.id)

    const claim = await getSupplierClaimByUserId(user.id)
    if (!claim) throw ERROR.DATABASE_ERROR('Supplier claim was not found after saving')

    return {
      supplier: mapSupplierToClient(claim.supplier),
      status: mapClaimStatus(claim.claim.status),
    }
  })

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
