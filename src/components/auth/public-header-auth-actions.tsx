import React from 'react'
import { ClientOnly } from '@/components/auth/client-only'
import { PublicStartFreeButton } from '@/components/auth/public-start-free-button'

const PublicHeaderAuthActionsClient = React.lazy(() =>
  import('@/components/auth/public-header-auth-actions.client').then(
    (module) => ({
      default: module.PublicHeaderAuthActionsClient,
    }),
  ),
)

export function PublicHeaderAuthActions() {
  return (
    <ClientOnly fallback={<PublicStartFreeButton />}>
      <React.Suspense fallback={<PublicStartFreeButton />}>
        <PublicHeaderAuthActionsClient />
      </React.Suspense>
    </ClientOnly>
  )
}
