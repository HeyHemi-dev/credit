import {
  RedirectToSignIn as BetterAuthRedirectToSignIn,
  SessionsCard,
  UpdateNameCard,
} from '@daveyplate/better-auth-ui'
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

type PathnameProps = {
  pathname: string
}

const ACCOUNT_PATHNAME = {
  SETTINGS: 'settings',
  SECURITY: 'security',
} as const

function AccountSettingsContent({ pathname }: PathnameProps) {
  if (pathname === ACCOUNT_PATHNAME.SECURITY) {
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

  return (
    <div className="grid w-full content-start gap-4 md:gap-6">
      <UpdateNameCard />
      <React.Suspense fallback={<ClaimSupplierSettingsCardSkeleton />}>
        <ClaimSupplierSettingsCard />
      </React.Suspense>
    </div>
  )
}

export function AccountViewClient({ pathname }: PathnameProps) {
  return (
    <AuthUiShell>
      <AccountSettingsContent pathname={pathname} />
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
