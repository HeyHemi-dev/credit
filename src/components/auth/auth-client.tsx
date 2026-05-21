import { Link } from '@tanstack/react-router'
import { LinkSquare02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  RedirectToSignIn as BetterAuthRedirectToSignIn,
  AuthView as BetterAuthView,
  SessionsCard,
  SignedIn,
  SignedOut,
  UpdateNameCard,
  UserButton,
} from '@daveyplate/better-auth-ui'
import { AuthQueryProvider } from '@daveyplate/better-auth-tanstack'
import { AuthUIProviderTanstack } from '@daveyplate/better-auth-ui/tanstack'
import React from 'react'
import betterAuthCss from '@daveyplate/better-auth-ui/css?url'
import { authClient } from '@/auth'
import { Brand, HeaderLayout } from '@/components/header'
import { PublicStartFreeButton } from '@/components/auth/auth-wrappers'
import { AUTH_REDIRECT_PATH } from '@/lib/auth-constants'

type PathnameProps = {
  pathname: string
}

const ACCOUNT_PATHNAME = {
  SETTINGS: 'settings',
  SECURITY: 'security',
} as const

function AuthUiShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthQueryProvider>
      <BetterAuthStylesheet />
      <AuthUIProviderTanstack
        authClient={authClient}
        social={{ providers: ['google'] }}
        credentials={false}
        organization={false}
        redirectTo={AUTH_REDIRECT_PATH}
        teams={false}
      >
        {children}
      </AuthUIProviderTanstack>
    </AuthQueryProvider>
  )
}

function BetterAuthStylesheet() {
  React.useEffect(() => {
    const linkId = 'better-auth-ui-css'
    if (document.getElementById(linkId)) return

    const link = document.createElement('link')
    link.id = linkId
    link.rel = 'stylesheet'
    link.href = betterAuthCss
    document.head.append(link)
  }, [])

  return null
}

function AccountSettingsContent({ pathname }: PathnameProps) {
  if (pathname === ACCOUNT_PATHNAME.SECURITY) {
    return (
      <div className="grid w-full content-start gap-4 md:gap-6">
        <SessionsCard />
      </div>
    )
  }

  return (
    <div className="grid w-full content-start gap-4 md:gap-6">
      <UpdateNameCard />
    </div>
  )
}

export function PublicHeaderAuthActionsClient() {
  return (
    <AuthUiShell>
      <SignedIn>
        <Link to={AUTH_REDIRECT_PATH}>
          <span className="flex items-center gap-2 text-sm">
            Open App
            <HugeiconsIcon icon={LinkSquare02Icon} size="16" />
          </span>
        </Link>
      </SignedIn>
      <SignedOut>
        <PublicStartFreeButton />
      </SignedOut>
    </AuthUiShell>
  )
}

export function AppHeaderAuthClient() {
  return (
    <AuthUiShell>
      <HeaderLayout
        left={
          <>
            <SignedIn>
              <Link to={AUTH_REDIRECT_PATH}>
                <Brand id="brand" />
              </Link>
            </SignedIn>
            <SignedOut>
              <Brand id="brand" />
            </SignedOut>
          </>
        }
        right={
          <SignedIn>
            <UserButton
              variant={'ghost'}
              size={'icon'}
              classNames={{
                trigger: {
                  avatar: {
                    fallback:
                      'bg-primary/60 text-primary-foreground w-full h-full',
                  },
                },
                content: {
                  user: {
                    avatar: {
                      fallback:
                        'bg-primary/60 text-primary-foreground w-full h-full',
                    },
                  },
                },
              }}
            />
          </SignedIn>
        }
      />
    </AuthUiShell>
  )
}

export function AuthViewClient({ pathname }: PathnameProps) {
  return (
    <AuthUiShell>
      <BetterAuthView
        pathname={pathname}
        localization={{
          SIGN_IN: 'Log in as a wedding supplier',
          SIGN_UP: 'Sign up as a wedding supplier',
        }}
        classNames={{
          base: 'max-w-auto',
          header: 'text-center',
          title: 'text-2xl font-light text-balance',
          description: 'text-sm text-muted-foreground text-pretty',
        }}
        cardFooter={
          <p className="grow text-center text-xs text-balance text-muted-foreground/60">
            By continuing, you agree to our{' '}
            <Link to="/terms" target="_blank">
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link to="/privacy" target="_blank">
              Privacy Policy
            </Link>
          </p>
        }
      />
    </AuthUiShell>
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
