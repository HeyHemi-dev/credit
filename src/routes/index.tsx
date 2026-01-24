import { createFileRoute } from '@tanstack/react-router'
import { RouteError } from '@/components/route-error'
import { Section } from '@/components/ui/section'

import { useAuthToken } from '@/hooks/use-auth-token'
import { AUTH_STATUS } from '@/lib/constants'

export const Route = createFileRoute('/')({
  ssr: false,
  component: Dashboard,
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
})

function Dashboard() {
  // TODO: implement auth token check that doesn't remount the component

  const authToken = useAuthToken()
  const navigate = Route.useNavigate()

  if (authToken.status === AUTH_STATUS.AUTHENTICATED)
    navigate({ to: '/dashboard', replace: true })

  return <Section></Section>
}
