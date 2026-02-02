import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import {
  SignedIn,
  SignedOut,
  UserButton,
} from '@neondatabase/neon-js/auth/react/ui'
import { Main } from '@/components/ui/section'
import { Brand, HeaderLayout } from '@/components/header'

export const Route = createFileRoute('/(app)/_appLayout')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Main
      header={
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
      }
    >
      <Outlet />
    </Main>
  )
}
