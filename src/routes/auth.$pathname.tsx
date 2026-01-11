import { createFileRoute } from '@tanstack/react-router'
import { AuthView } from '@neondatabase/neon-js/auth/react/ui'

export const Route = createFileRoute('/auth/$pathname')({
  component: Auth,
})

function Auth() {
  const { pathname } = Route.useParams()
  return (
    <div className="flex justify-center items-center min-h-screen bg-primary/10">
      <AuthView pathname={pathname} />
    </div>
  )
}
