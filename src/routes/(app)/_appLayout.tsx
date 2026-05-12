import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Main } from '@/components/ui/section'
import { AppHeaderAuth } from '@/components/auth/auth-wrappers'

export const Route = createFileRoute('/(app)/_appLayout')({
  ssr: false,
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Main header={<AppHeaderAuth />}>
      <Outlet />
    </Main>
  )
}
