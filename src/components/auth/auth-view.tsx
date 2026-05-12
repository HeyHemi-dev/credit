import React from 'react'
import { ClientOnly } from '@/components/auth/client-only'
import { Skeleton } from '@/components/ui/skeleton'

type AuthViewProps = {
  pathname: string
}

const AuthViewClient = React.lazy(() =>
  import('@/components/auth/auth-view.client').then((module) => ({
    default: module.AuthViewClient,
  })),
)

export function AuthView({ pathname }: AuthViewProps) {
  const fallback = <Skeleton className="mx-auto h-80 w-full max-w-md" />

  return (
    <ClientOnly fallback={fallback}>
      <React.Suspense fallback={fallback}>
        <AuthViewClient pathname={pathname} />
      </React.Suspense>
    </ClientOnly>
  )
}
