import { useNavigate } from '@tanstack/react-router'
import type { Supplier } from '@/lib/types/front-end'
import { ClaimSupplierSummary } from '@/components/suppliers/claim-supplier-shared'
import { useSupplierClaim } from '@/hooks/use-supplier-claims'
import { Button } from '@/components/ui/button'
import { FormErrorMessage } from '@/components/ui/form-error-message'

export function ClaimSupplierVerified({ supplier }: { supplier: Supplier }) {
  const { archiveClaimMutation } = useSupplierClaim()
  const navigate = useNavigate()

  return (
    <div className="grid gap-12">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-sm text-muted-foreground">
          Stop managing this profile:
        </p>
        <div>
          <Button
            type="button"
            variant="link"
            className="h-auto px-0 text-sm"
            onClick={() => archiveClaimMutation.mutate()}
            disabled={archiveClaimMutation.isPending}
          >
            {archiveClaimMutation.isPending
              ? 'Disconnecting…'
              : `Disconnect ${supplier.name}`}
          </Button>
        </div>
      </div>

      {archiveClaimMutation.error?.message && (
        <FormErrorMessage message={archiveClaimMutation.error.message} />
      )}

      <div className="grid gap-6">
        <ClaimSupplierSummary supplier={supplier} />

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => navigate({ to: '/account/edit-profile' })}
          >
            Edit supplier profile
          </Button>
        </div>
      </div>
    </div>
  )
}
