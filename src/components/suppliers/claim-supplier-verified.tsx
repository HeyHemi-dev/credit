import type { Supplier } from '@/lib/types/front-end'
import { ClaimSupplierSummary } from '@/components/suppliers/claim-supplier-shared'

export function ClaimSupplierVerified({ supplier }: { supplier: Supplier }) {
  return (
    <ClaimSupplierSummary
      title="This supplier profile is already yours."
      description="You’re connected to the supplier profile below."
      supplier={supplier}
    />
  )
}
