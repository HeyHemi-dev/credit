import { Link } from '@tanstack/react-router'
import { SignedIn, SignedOut, UserButton } from '@daveyplate/better-auth-ui'
import { AuthUiShell } from '@/components/auth/auth-ui-shell.client'
import { Brand, HeaderLayout } from '@/components/header'

export function AppHeaderAuthClient() {
  return (
    <AuthUiShell>
      <HeaderLayout
        left={
          <>
            <SignedIn>
              <Link to="/events">
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
