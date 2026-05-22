import type {
  Supplier,
  SupplierClaim,
  SupplierClaimStatus,
} from '@/lib/types/front-end'
import type { SupplierRow } from '@/db/queries/suppliers'
import {
  getSupplierClaimByUserId,
  getSupplierOwnedByUserId,
} from '@/db/queries/supplier-claims'
import { ERROR } from '@/lib/errors'

export async function getCurrentSupplierClaim(
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

export async function requireCurrentSupplierClaim(userId: string) {
  const claim = await getCurrentSupplierClaim(userId)
  if (!claim) throw ERROR.DATABASE_ERROR('Supplier claim was not found')
  return claim
}

export function mapClaimStatus(status: string): SupplierClaimStatus {
  if (status === 'approved') return 'approved'
  if (status === 'rejected') return 'rejected'
  return 'pending'
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
