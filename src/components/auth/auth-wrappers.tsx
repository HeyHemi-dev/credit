import { ClientOnly, Link } from '@tanstack/react-router'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Brand, HeaderLayout } from '@/components/header'

type PathnameProps = {
  pathname: string
}

const authClientImport = () => import('@/components/auth/auth-client')
const accountViewClientImport = () =>
  import('@/components/auth/account-view-client')

const PublicHeaderAuthActionsClient = React.lazy(() =>
  authClientImport().then((module) => ({
    default: module.PublicHeaderAuthActionsClient,
  })),
)

const AppHeaderAuthClient = React.lazy(() =>
  authClientImport().then((module) => ({
    default: module.AppHeaderAuthClient,
  })),
)

const AuthViewClient = React.lazy(() =>
  authClientImport().then((module) => ({
    default: module.AuthViewClient,
  })),
)

const RedirectToSignInClient = React.lazy(() =>
  accountViewClientImport().then((module) => ({
    default: module.RedirectToSignInClient,
  })),
)

export function PublicStartFreeButton() {
  return (
    <Button
      variant="default"
      className="min-w-[9em] justify-self-start bg-linear-to-br from-primary to-harakeke-500 shadow-xl shadow-primary/20"
      render={(props) => (
        <Link
          to="/auth/$pathname"
          params={{ pathname: 'sign-up' }}
          className={props.className}
        >
          Start Free
        </Link>
      )}
    />
  )
}

export function PublicHeaderAuthActions() {
  return (
    <ClientOnly fallback={<PublicStartFreeButton />}>
      <React.Suspense fallback={<PublicStartFreeButton />}>
        <PublicHeaderAuthActionsClient />
      </React.Suspense>
    </ClientOnly>
  )
}

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

export function AuthView({ pathname }: PathnameProps) {
  const fallback = <Skeleton className="mx-auto h-80 w-full max-w-md" />

  return (
    <ClientOnly fallback={fallback}>
      <React.Suspense fallback={fallback}>
        <AuthViewClient pathname={pathname} />
      </React.Suspense>
    </ClientOnly>
  )
}

export function RedirectToSignIn() {
  return (
    <ClientOnly>
      <React.Suspense fallback={null}>
        <RedirectToSignInClient />
      </React.Suspense>
    </ClientOnly>
  )
}
