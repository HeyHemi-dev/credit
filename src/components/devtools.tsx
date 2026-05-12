import React from 'react'
import { ClientOnly } from '@/components/auth/client-only'
import { isDev } from '@/lib/utils'

const DevToolsClient = React.lazy(() =>
  import('@/components/devtools.client').then((module) => ({
    default: module.DevToolsClient,
  })),
)

export function DevTools() {
  if (!isDev) return null

  return (
    <ClientOnly>
      <React.Suspense fallback={null}>
        <DevToolsClient />
      </React.Suspense>
    </ClientOnly>
  )
}
