import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { RouteError } from '@/components/ui/route-error'
import { Section } from '@/components/ui/section'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateSupplierForm } from '@/components/couple/create-supplier-form'
import { useCoupleEvent } from '@/hooks/use-couple'

export const Route = createFileRoute('/couple/$token/suppliers/new')({
  component: CreateSupplierRoute,
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
})

function CreateSupplierRoute() {
  const { token } = Route.useParams()

  return (
    <React.Suspense fallback={<CreateSupplierSkeleton />}>
      <CreateSupplier token={token} />
    </React.Suspense>
  )
}

function CreateSupplier({ token }: { token: string }) {
  const navigate = useNavigate()
  const { coupleEventQuery } = useCoupleEvent(token)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  return (
    <Section className="py-6">
      <div className="grid gap-3">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/couple/$token', params: { token } })}
        >
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create a new supplier</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div ref={containerRef}>
              <CreateSupplierForm
                shareToken={token}
                containerRef={containerRef}
                defaultRegion={coupleEventQuery.data.event.region}
                onComplete={() =>
                  navigate({ to: '/couple/$token', params: { token } })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}

function CreateSupplierSkeleton() {
  return (
    <Section className="py-6">
      <Card>
        <CardHeader>
          <CardTitle>Loading…</CardTitle>
        </CardHeader>
      </Card>
    </Section>
  )
}

