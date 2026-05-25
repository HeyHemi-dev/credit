import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import { UpdateNameCard } from '@daveyplate/better-auth-ui'
import React from 'react'
import { AccountNav } from '@/components/auth/account-nav'
import { AuthUiShell } from '@/components/auth/auth-ui-shell'
import { PendingClaimVerificationSection } from '@/components/suppliers/claim-supplier-verification-pending'
import { ClaimSupplierForm } from '@/components/suppliers/claim-supplier-form'
import { ClaimStateMessage } from '@/components/suppliers/claim-supplier-shared'
import { useMySupplierClaim } from '@/hooks/use-supplier-claims'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Section } from '@/components/ui/section'

export const Route = createFileRoute('/(app)/_appLayout/account/settings')({
  component: AccountSettings,
})

function AccountSettings() {
  const fallback = (
    <div className="grid w-full content-start gap-4 md:gap-6">
      <SettingsCardSkeleton />
      <SettingsCardSkeleton />
    </div>
  )

  return (
    <Section>
      <AccountNav />
      <ClientOnly fallback={fallback}>
        <React.Suspense fallback={fallback}>
          <AccountSettingsViewClient />
        </React.Suspense>
      </ClientOnly>
    </Section>
  )
}

function AccountSettingsViewClient() {
  return (
    <AuthUiShell>
      <div className="grid w-full content-start gap-4 md:gap-6">
        <UpdateNameCard />
        <ClaimSupplierCard />
      </div>
    </AuthUiShell>
  )
}

function ClaimSupplierCard() {
  const { claimQuery } = useMySupplierClaim()
  const [isChangingSupplier, setIsChangingSupplier] = React.useState(false)
  const pendingSupplierId =
    claimQuery.data?.status === 'pending' ? claimQuery.data.supplier.id : null
  const previousPendingSupplierIdRef = React.useRef(pendingSupplierId)

  React.useEffect(() => {
    if (claimQuery.data?.status !== 'pending') setIsChangingSupplier(false)
    if (pendingSupplierId !== previousPendingSupplierIdRef.current) {
      setIsChangingSupplier(false)
    }

    previousPendingSupplierIdRef.current = pendingSupplierId
  }, [claimQuery.data?.status, pendingSupplierId])

  const title =
    claimQuery.data?.status === 'pending' && !isChangingSupplier
      ? `Claim ${claimQuery.data.supplier.name}`
      : 'Claim your supplier profile'

  let description =
    'Search for your supplier profile. We’ll email a 6-character verification code so you can confirm you own or manage it.'
  if (claimQuery.data?.status === 'pending' && !isChangingSupplier) {
    description =
      'Check your email and enter the verification code below to finish claiming this supplier profile.'
  }
  if (claimQuery.data?.status === 'pending' && isChangingSupplier) {
    description =
      'Search for the right supplier profile. Sending a new code will update your pending claim.'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg leading-none font-semibold md:text-xl">
          {title}
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {description}
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

        {claimQuery.data?.status === 'pending' && !isChangingSupplier && (
          <>
            <ClaimStateMessage
              title="You are claiming this supplier profile."
              description={`We sent a verification code to ${claimQuery.data.supplier.email}.`}
              supplier={claimQuery.data.supplier}
            />
            <PendingClaimVerificationSection claim={claimQuery.data} />
            <div className="flex justify-start">
              <Button
                type="button"
                variant="link"
                className="h-auto px-0 text-sm"
                onClick={() => setIsChangingSupplier(true)}
              >
                Not the right supplier? Claim a different supplier.
              </Button>
            </div>
          </>
        )}

        {(claimQuery.data?.status !== 'claimed' &&
          claimQuery.data?.status !== 'pending') ||
        isChangingSupplier ? (
          <>
            <ClaimSupplierForm
              initialSupplier={
                isChangingSupplier ? null : (claimQuery.data?.supplier ?? null)
              }
            />
            {isChangingSupplier && claimQuery.data?.status === 'pending' && (
              <div className="flex justify-start">
                <Button
                  type="button"
                  variant="link"
                  className="h-auto px-0 text-sm"
                  onClick={() => setIsChangingSupplier(false)}
                >
                  Still claiming {claimQuery.data.supplier.name}? Go back to
                  verification.
                </Button>
              </div>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}

function SettingsCardSkeleton() {
  return <Skeleton className="h-80 w-full" />
}
