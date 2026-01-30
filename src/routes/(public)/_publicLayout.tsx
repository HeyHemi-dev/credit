import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { LinkSquare02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { SignedIn, SignedOut } from '@neondatabase/neon-js/auth/react'
import { Brand, HeaderLayout } from '@/components/header'
import { Main, Section, SectionContent } from '@/components/ui/section'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/(public)/_publicLayout')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Main header={<Header />} footer={<Footer />}>
      <Outlet />
    </Main>
  )
}

function Header() {
  return (
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
  )
}

function Footer() {
  return (
    <SectionContent className="grid grid-cols-2 gap-6">
      <div className="col-span-full grid gap-2">
        <h2 aria-label="Footer">
          <Brand />
        </h2>
        <p className="text-sm text-pretty text-muted-foreground">
          Effortlessly collect supplier details from couples, formatted and
          ready-to-paste into Instagram.
        </p>
      </div>
      <div className="grid content-start gap-2">
        <h3 className="label">Links</h3>
        <ul className="grid gap-2">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/auth/$pathname" params={{ pathname: 'sign-up' }}>
              Sign up
            </Link>
          </li>
        </ul>
      </div>
      <div className="grid content-start gap-2">
        <h3 className="label">Legal</h3>
        <ul className="grid gap-2">
          <li>
            <Link to="/">Privacy Policy</Link>
          </li>
          <li>
            <Link to="/">Terms of Service</Link>
          </li>
        </ul>
      </div>
      <div className="col-span-full grid gap-2">
        <p className="text-sm text-muted-foreground/60">
          © {new Date().getFullYear()} With Thanks. All rights reserved.
        </p>
      </div>
    </SectionContent>
  )
}
