import * as React from 'react'
import { z } from 'zod'
import {
  createFileRoute,
  useCanGoBack,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { RouteError } from '@/components/ui/route-error'
import { Section } from '@/components/ui/section'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BackButton } from '@/components/back-button'
import { CreateSupplierForm } from '@/components/couple/create-supplier-form'

const createSupplierSearchSchema = z.object({
  eventId: z.string().uuid().optional(),
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
  const { eventId } = Route.useSearch()
  const navigate = useNavigate()
  const route = useRouter()
  const canGoBack = useCanGoBack()
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const handleComplete = () => {
    if (canGoBack) {
      route.history.back()
      return
    }

    navigate({ to: '/' })
  }

  return (
    <Section className="py-6">
      <div className="grid gap-3">
        <BackButton />
        <Card>
          <CardHeader>
            <CardTitle>Create a new supplier</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div ref={containerRef}>
              <CreateSupplierForm
                eventId={eventId}
                containerRef={containerRef}
                defaultRegion={null}
                onComplete={handleComplete}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
