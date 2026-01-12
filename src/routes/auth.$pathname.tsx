import { createFileRoute } from '@tanstack/react-router'
import { AuthView } from '@neondatabase/neon-js/auth/react/ui'
import { Main } from '@/components/ui/section'

export const Route = createFileRoute('/auth/$pathname')({
  component: Auth,
})

function Auth() {
  const { pathname } = Route.useParams()
  return (
    <Main className="flex justify-center items-center ">
      <AuthView pathname={pathname} />
    </Main>
  )
}
