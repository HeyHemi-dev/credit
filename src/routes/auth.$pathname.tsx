import { createFileRoute } from '@tanstack/react-router'
import { AuthView } from '@neondatabase/neon-js/auth/react/ui'
import { Section } from '@/components/ui/section'

export const Route = createFileRoute('/auth/$pathname')({
  component: Auth,
})

function Auth() {
  const { pathname } = Route.useParams()
  return (
    <Section className="flex items-center justify-center bg-transparent">
      <AuthView pathname={pathname} />
    </Section>
  )
}
