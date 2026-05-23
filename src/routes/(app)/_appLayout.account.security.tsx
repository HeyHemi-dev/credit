import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import {
  SessionsCard,
} from '@daveyplate/better-auth-ui'
import React from 'react'
import { AccountNav } from '@/components/auth/account-nav'
import { AuthUiShell } from '@/components/auth/auth-ui-shell'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Section } from '@/components/ui/section'

export const Route = createFileRoute('/(app)/_appLayout/account/security')({
  component: AccountSecurity,
})

function AccountSecurity() {
  const fallback = <Skeleton className="h-80 w-full" />

  return (
    <Section>
      <AccountNav />
      <ClientOnly fallback={fallback}>
        <React.Suspense fallback={fallback}>
          <AccountSecurityViewClient />
        </React.Suspense>
      </ClientOnly>
    </Section>
  )
}

function AccountSecurityViewClient() {
  return (
    <AuthUiShell>
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
    </AuthUiShell>
  )
}
