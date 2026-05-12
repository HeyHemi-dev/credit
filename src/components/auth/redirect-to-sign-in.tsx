import React from 'react'
import { ClientOnly } from '@/components/auth/client-only'

const RedirectToSignInClient = React.lazy(() =>
  import('@/components/auth/redirect-to-sign-in.client').then((module) => ({
    default: module.RedirectToSignInClient,
  })),
)

export function RedirectToSignIn() {
  return (
    <ClientOnly>
      <React.Suspense fallback={null}>
        <RedirectToSignInClient />
      </React.Suspense>
    </ClientOnly>
  )
}
