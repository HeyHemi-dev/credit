import React from 'react'
import { ClientOnly } from '@/components/auth/client-only'
import { Skeleton } from '@/components/ui/skeleton'

type AccountViewProps = {
  pathname: string
}

const AccountViewClient = React.lazy(() =>
  import('@/components/auth/account-view.client').then((module) => ({
    default: module.AccountViewClient,
  })),
)

export function AccountView({ pathname }: AccountViewProps) {
  const fallback = <Skeleton className="h-80 w-full" />

  return (
    <ClientOnly fallback={fallback}>
      <React.Suspense fallback={fallback}>
        <AccountViewClient pathname={pathname} />
      </React.Suspense>
    </ClientOnly>
  )
}
