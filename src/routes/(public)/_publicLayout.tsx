import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { LinkSquare02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { SignedIn, SignedOut } from '@neondatabase/neon-js/auth/react'
import { Brand, HeaderLayout } from '@/components/header'
import { Main } from '@/components/ui/section'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/(public)/_publicLayout')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Main
      header={
        <HeaderLayout
          left={
            <Link to="/">
              <Brand id="brand" />
            </Link>
          }
          right={
            <>
              <SignedIn>
                <Link to="/events">
                  <span className="flex items-center gap-2 text-sm">
                    Open App
                    <HugeiconsIcon icon={LinkSquare02Icon} size="16" />
                  </span>
                </Link>
              </SignedIn>
              <SignedOut>
                <Button
                  variant="default"
                  className="min-w-[9em] justify-self-start bg-linear-to-br from-teal-400 to-primary shadow-xl shadow-primary/20"
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
              </SignedOut>
            </>
          }
        ></HeaderLayout>
      }
    >
      <Outlet />
    </Main>
  )
}
