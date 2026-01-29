import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Main } from '@/components/ui/section'
import { Header } from '@/components/header'

export const Route = createFileRoute('/(app)/_appLayout')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Main header={<Header />}>
      <Outlet />
    </Main>
  )
}
