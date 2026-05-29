import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import { UpdateNameCard } from '@daveyplate/better-auth-ui'
import React from 'react'
import type { SupplierClaim } from '@/lib/types/front-end'
import { AccountNav } from '@/components/auth/account-nav'
import { AuthUiShell } from '@/components/auth/auth-ui-shell'
import { ClaimSupplierForm } from '@/components/suppliers/claim-supplier-form'
import { ClaimSupplierPending } from '@/components/suppliers/claim-supplier-pending'
import { ClaimSupplierVerified } from '@/components/suppliers/claim-supplier-verified'
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
        <ClaimSupplierCard />
      </div>
    </AuthUiShell>
  )
}

function ClaimSupplierCard() {
  const { claimQuery } = useMySupplierClaim()
  const claimCardState = getClaimSupplierCardState(claimQuery.data)

  let content: React.ReactNode
  if (claimCardState.state === 'pending') {
    content = <ClaimSupplierPending claim={claimCardState.claim} />
  } else if (claimCardState.state === 'claimed') {
    content = <ClaimSupplierVerified supplier={claimCardState.claim.supplier} />
  } else {
    content = (
      <ClaimSupplierForm initialSupplier={claimCardState.initialSupplier} />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg leading-none font-semibold md:text-xl">
          {claimCardState.title}
        </CardTitle>
        {claimCardState.description && (
          <CardDescription className="text-xs md:text-sm">
            {claimCardState.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}

function getClaimSupplierCardState(claim: SupplierClaim | null) {
  if (claim?.status === 'pending') {
    return {
      state: 'pending' as const,
      title: `Claim ${claim.supplier.name}`,
      description: claim.verification?.lastSentAt
        ? `We sent a verification code to ${claim.supplier.email}. Enter the code below to confirm that you own or manage this supplier profile.`
        : `We’ll send a verification code to ${claim.supplier.email}.`,
      claim,
    }
  }

  if (claim?.status === 'claimed') {
    return {
      state: 'claimed' as const,
      title: 'Supplier profile linked',
      description: `${claim.supplier.name} is linked to your account. You can now manage this
        supplier profile and keep its details up to date.`,
      claim,
    }
  }

  return {
    state: 'initial' as const,
    title: 'Claim your supplier profile',
    description:
      'Search for your supplier profile. We’ll email a verification code so you can confirm you own or manage it.',
    initialSupplier: claim?.supplier ?? null,
  }
}

function SettingsCardSkeleton() {
  return <Skeleton className="h-80 w-full" />
}
