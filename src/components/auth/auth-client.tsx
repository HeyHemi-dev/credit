import { Link } from '@tanstack/react-router'
import { LinkSquare02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  AuthView as BetterAuthView,
  SignedIn,
  SignedOut,
  UserButton,
} from '@daveyplate/better-auth-ui'
import { AuthUiShell } from '@/components/auth/auth-ui-shell'
import { Brand, HeaderLayout } from '@/components/header'
import { PublicStartFreeButton } from '@/components/auth/auth-wrappers'
import { AUTH_REDIRECT_PATH } from '@/lib/auth-constants'

type PathnameProps = {
  pathname: string
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
