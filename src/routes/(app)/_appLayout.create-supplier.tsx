import { z } from 'zod'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { Supplier } from '@/lib/types/front-end'

import { RouteError } from '@/components/route-error'
import { Section } from '@/components/ui/section'
import { BackButton } from '@/components/back-button'
import { CreateSupplierForm } from '@/components/suppliers/create-supplier-form'
import { AuthState } from '@/components/auth-state'
import { useAuth } from '@/hooks/use-auth'
import {
  eventIdSchema,
  shareTokenSchema,
} from '@/lib/types/validation-schema'

const createSupplierReturnSearchSchema = z.discriminatedUnion('returnTo', [
  z.object({
    returnTo: z.literal('event'),
    eventId: eventIdSchema,
  }),
  z.object({
    returnTo: z.literal('share'),
    shareToken: shareTokenSchema,
  }),
])

const createSupplierSearchSchema = z.union([
  createSupplierReturnSearchSchema,
  z.object({
    shareToken: shareTokenSchema.optional(),
    returnTo: z.undefined().optional(),
  }),
])
type CreateSupplierSearch = z.infer<typeof createSupplierSearchSchema>
type CreateSupplierReturnSearch = z.infer<
  typeof createSupplierReturnSearchSchema
>

export const Route = createFileRoute('/(app)/_appLayout/create-supplier')({
  ssr: false,
  component: CreateSupplierRoute,
  validateSearch: createSupplierSearchSchema,
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
})

function CreateSupplierRoute() {
  const search = Route.useSearch()
  const navigate = useNavigate()
  const shareToken = 'shareToken' in search ? search.shareToken : undefined
  const returnResult = getReturnResult(search)
  const authToken = useAuth(shareToken)

  function handleCreated(supplier: Supplier) {
    if (!returnResult) return

    if (returnResult.returnTo === 'event') {
      navigate({
        to: '/events/$eventId',
        params: { eventId: returnResult.eventId },
        search: { panel: true, supplierId: supplier.id },
      })
      return
    }

    navigate({
      to: '/s/$token',
      params: { token: returnResult.shareToken },
      search: { panel: true, supplierId: supplier.id },
    })
  }

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
        <CreateSupplierForm
          authToken={authToken}
          onCreated={returnResult ? handleCreated : undefined}
        />
      </div>

      <AuthState authToken={authToken} />
    </Section>
  )
}

function getReturnResult(
  search: CreateSupplierSearch,
): CreateSupplierReturnSearch | null {
  if (search.returnTo === 'event' || search.returnTo === 'share') return search
  return null
}
