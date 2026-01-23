import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, Loading02Icon } from '@hugeicons/core-free-icons'
import { RouteError } from '@/components/route-error'
import { Section } from '@/components/ui/section'
import { BackButton } from '@/components/back-button'
import { CreateSupplierForm } from '@/components/suppliers/create-supplier-form'
import { authClient } from '@/auth'
import { resolveAuthToken } from '@/lib/utils'
import { AUTH_STATUS } from '@/lib/constants'

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

  const authToken = resolveAuthToken({
    isPending,
    sessionToken: data?.session.token,
    shareToken,
  })

  return (
    <Section>
      <BackButton />

      <div className="grid gap-6">
        <div className="grid gap-0.5">
          <h1 className="text-2xl font-light">Create a new supplier</h1>
          <p className="text-sm text-muted-foreground">
            Create a new supplier anyone can use.
          </p>
        </div>
        <CreateSupplierForm authToken={authToken} />
      </div>

      {authToken.status ===
        (AUTH_STATUS.PENDING || AUTH_STATUS.UNAUTHENTICATED) && (
        <AuthState
          isPending={authToken.status === AUTH_STATUS.PENDING}
          message={
            authToken.status === AUTH_STATUS.PENDING
              ? 'Checking authentication...'
              : 'Not authenticated. Please log in, or request a new share link'
          }
        />
      )}
    </Section>
  )
}

export function AuthState({
  isPending,
  message,
}: {
  isPending: boolean
  message: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border p-6 text-muted-foreground">
      {isPending ? (
        <HugeiconsIcon icon={Loading02Icon} className="animate-spin" />
      ) : (
        <HugeiconsIcon icon={Alert02Icon} />
      )}
      <p className="text-sm">{message}</p>
    </div>
  )
}
