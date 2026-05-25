import type { Supplier } from '@/lib/types/front-end'
import { ClaimSupplierSummary } from '@/components/suppliers/claim-supplier-shared'

export function ClaimSupplierVerified({ supplier }: { supplier: Supplier }) {
  return (
    <div className="grid gap-6">
      <p className="text-sm text-muted-foreground">
        {supplier.name} is linked to your account. You can now manage this
        supplier profile and keep its details up to date.
      </p>

      <ClaimSupplierSummary supplier={supplier} />
    </div>
  )
}
