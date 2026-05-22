import { PendingClaimVerificationSection } from '@/components/suppliers/pending-claim-verification-section'
import {
  ClaimStateMessage,
} from '@/components/suppliers/supplier-claim-shared'
import { ClaimSupplierForm } from '@/components/suppliers/claim-supplier-form'
import { useMySupplierClaim } from '@/hooks/use-supplier-claims'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// TODO: make a settings card component for consistent styling of cards. props: title, description, children
export function ClaimSupplierSettingsCard() {
  const { claimQuery } = useMySupplierClaim()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg leading-none font-semibold md:text-xl">
          Claim Your Business
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Search for your business to start a claim. We will email you a
          one-time code to verify your ownership.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {claimQuery.data?.status === 'claimed' && (
          <ClaimStateMessage
            title="This supplier profile is already yours."
            description="You’re connected to the supplier profile below."
            supplier={claimQuery.data.supplier}
          />
        )}

        {claimQuery.data?.status === 'pending' && (
          <>
            <ClaimStateMessage
              title="Your supplier claim is pending."
              description="Finish verification with the 6-character code sent to this supplier email."
              supplier={claimQuery.data.supplier}
            />
            <PendingClaimVerificationSection claim={claimQuery.data} />
          </>
        )}

        {claimQuery.data?.status !== 'claimed' && (
          <ClaimSupplierForm
            initialSupplier={claimQuery.data?.supplier ?? null}
          />
        )}
      </CardContent>
    </Card>
  )
}
