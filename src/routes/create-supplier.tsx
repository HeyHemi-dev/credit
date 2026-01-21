import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import type { AuthToken } from '@/lib/types/validation-schema'
import { RouteError } from '@/components/ui/route-error'
import { Section } from '@/components/ui/section'
import { BackButton } from '@/components/back-button'
import { CreateSupplierForm } from '@/components/suppliers/create-supplier-form'
import { authClient } from '@/auth'
import { ERROR } from '@/lib/errors'

const createSupplierSearchSchema = z.object({
  shareToken: z.string().optional(),
})

export const Route = createFileRoute('/create-supplier')({
  ssr: false,
  component: CreateSupplierRoute,
  validateSearch: (search) => createSupplierSearchSchema.parse(search),
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
})

function CreateSupplierRoute() {
  const { data, isPending } = authClient.useSession()
  const { shareToken } = Route.useSearch()

  if (isPending) return <div>Loading...</div>
  if (!data && !shareToken)
    throw ERROR.NOT_AUTHENTICATED(
      'Please log in, or request a new link, to create a supplier',
    )

  const authToken: AuthToken = data
    ? { token: data.session.token, tokenType: 'sessionToken' }
    : // we can safely assert shareToken exists because we ensured
      // either auth data or share token is present
      { token: shareToken!, tokenType: 'shareToken' }

  return (
    <Section>
      <div className="flex justify-start">
        <BackButton />
      </div>

      <h1 className="text-2xl font-light">Create a new supplier</h1>

      <CreateSupplierForm authToken={authToken} />
    </Section>
  )
}
