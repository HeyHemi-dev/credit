import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import { UpdateNameCard } from '@daveyplate/better-auth-ui'
import React from 'react'
import { AccountNav } from '@/components/auth/account-nav'
import { AuthUiShell } from '@/components/auth/auth-ui-shell'
import { ClaimSupplierVerificationPending } from '@/components/suppliers/claim-supplier-pending'
import { ClaimSupplierForm } from '@/components/suppliers/claim-supplier-form'
import { ClaimSupplierVerified } from '@/components/suppliers/claim-supplier-shared'
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
  const isClaimPending = claimQuery.data?.status === 'pending'
  const pendingClaim = isClaimPending ? claimQuery.data : null
  const isClaimed = claimQuery.data?.status === 'claimed'
  const claimedClaim = isClaimed ? claimQuery.data : null

  const title = claimedClaim
    ? 'Supplier profile claimed'
    : pendingClaim
      ? `Claim ${pendingClaim.supplier.name}`
      : 'Claim your supplier profile'

  let description =
    'Search for your supplier profile. We’ll email a 6-character verification code so you can confirm you own or manage it.'
  if (claimedClaim) {
    description = 'Your account is already connected to this supplier profile.'
  }
  if (pendingClaim) {
    description =
      'Check your email and enter the verification code below to finish claiming this supplier profile.'
  }

  let content: React.ReactNode = (
    <ClaimSupplierForm initialSupplier={claimQuery.data?.supplier ?? null} />
  )

  if (pendingClaim)
    content = <ClaimSupplierVerificationPending claim={pendingClaim} />

  if (claimedClaim) {
    content = <ClaimSupplierVerified supplier={claimedClaim.supplier} />
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
      <CardContent className="grid gap-6">{content}</CardContent>
    </Card>
  )
}

function SettingsCardSkeleton() {
  return <Skeleton className="h-80 w-full" />
}
