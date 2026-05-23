import { RedirectToSignIn as BetterAuthRedirectToSignIn, SessionsCard, UpdateNameCard } from '@daveyplate/better-auth-ui'
import React from 'react'
import { AuthUiShell } from '@/components/auth/auth-ui-shell'
import {
  ClaimSupplierSettingsCard,
  ClaimSupplierSettingsCardSkeleton,
} from '@/components/suppliers/claim-supplier-settings-card'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function AccountSettingsContent() {
  return (
    <div className="grid w-full content-start gap-4 md:gap-6">
      <UpdateNameCard />
      <React.Suspense fallback={<ClaimSupplierSettingsCardSkeleton />}>
        <ClaimSupplierSettingsCard />
      </React.Suspense>
    </div>
  )
}

function AccountSecurityContent() {
  return (
    <div className="grid w-full content-start gap-4 md:gap-6">
      <SessionsCard />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-none font-semibold md:text-xl">
            Delete Account
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            To delete your account and associated data, please contact us.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a
            href="mailto:hello.hemi.phillips@gmail.com"
            className="text-primary text-sm underline-offset-4 hover:underline"
          >
            hello.hemi.phillips@gmail.com
          </a>
        </CardContent>
      </Card>
    </div>
  )
}

export function AccountSettingsViewClient() {
  return (
    <AuthUiShell>
      <AccountSettingsContent />
    </AuthUiShell>
  )
}

export function AccountSecurityViewClient() {
  return (
    <AuthUiShell>
      <AccountSecurityContent />
    </AuthUiShell>
  )
}

export function RedirectToSignInClient() {
  return (
    <AuthUiShell>
      <BetterAuthRedirectToSignIn />
    </AuthUiShell>
  )
}
