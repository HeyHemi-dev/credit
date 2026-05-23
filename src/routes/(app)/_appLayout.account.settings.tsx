import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import { UpdateNameCard } from '@daveyplate/better-auth-ui'
import React from 'react'
import { AccountNav } from '@/components/auth/account-nav'
import { AuthUiShell } from '@/components/auth/auth-ui-shell'
import {
  PendingClaimVerificationSection,
} from '@/components/suppliers/pending-claim-verification-section'
import { ClaimSupplierForm } from '@/components/suppliers/claim-supplier-form'
import { ClaimStateMessage } from '@/components/suppliers/supplier-claim-shared'
import { useMySupplierClaim } from '@/hooks/use-supplier-claims'
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
      <Skeleton className="h-80 w-full" />
      <ClaimSupplierSettingsCardSkeleton />
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
  const { claimQuery } = useMySupplierClaim()

  return (
    <AuthUiShell>
      <div className="grid w-full content-start gap-4 md:gap-6">
        <UpdateNameCard />
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
      </div>
    </AuthUiShell>
  )
}

function ClaimSupplierSettingsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2 rounded-2xl border border-border/60 bg-muted/30 p-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="grid gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}
