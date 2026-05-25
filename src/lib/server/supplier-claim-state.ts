import type { Supplier, SupplierClaim } from '@/lib/types/front-end'
import type { SupplierRow } from '@/db/queries/suppliers'
import { getSupplierClaimByUserId } from '@/db/queries/supplier-claims'
import { SUPPLIER_CLAIM_STATUS } from '@/lib/constants'
import { ERROR } from '@/lib/errors'

export async function getCurrentSupplierClaim(
  userId: string,
): Promise<SupplierClaim | null> {
  const claim = await getSupplierClaimByUserId(userId)
  if (!claim) return null

  if (claim.claim.status === SUPPLIER_CLAIM_STATUS.APPROVED) {
    return {
      supplier: mapSupplierToClient(claim.supplier),
      status: 'claimed',
      verification: null,
    }
  }

  return {
    supplier: mapSupplierToClient(claim.supplier),
    status: 'pending',
    verification: {
      email: claim.supplier.email,
      lastSentAt: claim.verification?.lastSentAt.toISOString() ?? null,
    },
  }
}

export async function requireCurrentSupplierClaim(userId: string) {
  const claim = await getCurrentSupplierClaim(userId)
  if (!claim) throw ERROR.DATABASE_ERROR('Supplier claim was not found')
  return claim
}

export function mapSupplierToClient(supplier: SupplierRow): Supplier {
  return {
    id: supplier.id,
    name: supplier.name,
    email: supplier.email,
    region: supplier.region,
    instagramHandle: supplier.instagramHandle,
    tiktokHandle: supplier.tiktokHandle,
  }
}
