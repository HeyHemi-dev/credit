import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'

import { RouteError } from '@/components/route-error'
import { Section } from '@/components/ui/section'
import { BackButton } from '@/components/back-button'
import { CreateSupplierForm } from '@/components/suppliers/create-supplier-form'
import { AuthState } from '@/components/auth-state'
import { useAuth } from '@/hooks/use-auth'

const createSupplierSearchSchema = z.object({
  shareToken: z.string().optional(),
})

export const Route = createFileRoute('/(app)/_appLayout/create-supplier')({
  ssr: false,
  component: CreateSupplierRoute,
  validateSearch: createSupplierSearchSchema,
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
})

function CreateSupplierRoute() {
  const { shareToken } = Route.useSearch()
  const authToken = useAuth(shareToken)

  return (
    <Section>
      <BackButton />

      <div className="grid gap-6">
        <div className="grid gap-0.5">
          <h1 className="text-2xl font-light">Create a new supplier</h1>
          <p className="text-sm text-muted-foreground">
            This creates a shared supplier others can use.
          </p>
        </div>
        <CreateSupplierForm authToken={authToken} />
      </div>

      <AuthState authToken={authToken} />
    </Section>
  )
}
