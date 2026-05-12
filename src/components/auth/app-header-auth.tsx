import React from 'react'
import { ClientOnly } from '@/components/auth/client-only'
import { Brand, HeaderLayout } from '@/components/header'

const AppHeaderAuthClient = React.lazy(() =>
  import('@/components/auth/app-header-auth.client').then((module) => ({
    default: module.AppHeaderAuthClient,
  })),
)

export function AppHeaderAuth() {
  const fallback = <HeaderLayout left={<Brand id="brand" />} right={null} />

  return (
    <ClientOnly fallback={fallback}>
      <React.Suspense fallback={fallback}>
        <AppHeaderAuthClient />
      </React.Suspense>
    </ClientOnly>
  )
}
