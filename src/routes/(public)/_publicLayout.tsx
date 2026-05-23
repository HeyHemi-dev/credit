import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { Brand, HeaderLayout } from '@/components/header'
import { Main, SectionContent } from '@/components/ui/section'
import { PublicHeaderAuthActions } from '@/components/auth/auth-wrappers'
import { HOME_DESCRIPTION } from '@/lib/seo'

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
      right={<PublicHeaderAuthActions />}
    ></HeaderLayout>
  )
}

function Footer() {
  return (
    <SectionContent className="grid grid-cols-2 gap-6">
      <div className="col-span-full grid gap-2">
        <h2 aria-label="Footer">
          <Brand className="" />
        </h2>
        <p className="text-sm text-pretty opacity-50">
          {HOME_DESCRIPTION}
        </p>
      </div>
      <div className="grid content-start gap-4">
        <h3 className="label">Links</h3>
        <ul className="grid gap-2">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/auth/sign-up">
              Sign up
            </Link>
          </li>
        </ul>
      </div>
      <div className="grid content-start gap-4">
        <h3 className="label">Legal</h3>
        <ul className="grid gap-2">
          <li>
            <Link to="/privacy">Privacy Policy</Link>
          </li>
          <li>
            <Link to="/terms">Terms of Service</Link>
          </li>
        </ul>
      </div>
      <div className="col-span-full grid gap-2">
        <p className="text-sm opacity-50">
          © {new Date().getFullYear()} With Thanks. All rights reserved.
        </p>
      </div>
    </SectionContent>
  )
}
