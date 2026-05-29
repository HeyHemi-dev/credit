import {
  ClientOnly,
  createFileRoute,
  useNavigate,
} from '@tanstack/react-router'
import React from 'react'
import { AccountNav } from '@/components/auth/account-nav'
import { AuthUiShell } from '@/components/auth/auth-ui-shell'
import { EditSupplierProfileForm } from '@/components/suppliers/edit-supplier-profile-form'
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

export const Route = createFileRoute('/(app)/_appLayout/account/edit-profile')({
  component: AccountEditProfile,
})

function AccountEditProfile() {
  const fallback = <Skeleton className="h-192 w-full" />

  return (
    <Section>
      <AccountNav />
      <ClientOnly fallback={fallback}>
        <React.Suspense fallback={fallback}>
          <AccountEditProfileViewClient />
        </React.Suspense>
      </ClientOnly>
    </Section>
  )
}

function AccountEditProfileViewClient() {
  const navigate = useNavigate()
  const { claimQuery } = useMySupplierClaim()
  const claim = claimQuery.data

  React.useEffect(() => {
    if (claim?.status === 'claimed') return
    navigate({ to: '/account/settings', replace: true })
  }, [claim, navigate])

  if (claim?.status !== 'claimed') return null

  return (
    <AuthUiShell>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-none font-semibold md:text-xl">
            {`Edit profile for ${claim.supplier.name}`}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Update your public business details so you can be credited
            correctly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditSupplierProfileForm supplier={claim.supplier} />
        </CardContent>
      </Card>
    </AuthUiShell>
  )
}
