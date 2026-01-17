import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { RouteError } from '@/components/ui/route-error'
import { Section } from '@/components/ui/section'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IntroModal } from '@/components/couple/IntroModal'
import { SupplierList } from '@/components/couple/SupplierList'
import { useCoupleEvent } from '@/hooks/use-couple'

export const Route = createFileRoute('/couple/$token')({
  ssr: false,
  component: CoupleEventRoute,
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
})

function CoupleEventRoute() {
  const { token } = Route.useParams()

  return (
    <React.Suspense fallback={<CoupleEventSkeleton />}>
      <CoupleEvent token={token} />
    </React.Suspense>
  )
}

function CoupleEvent({ token }: { token: string }) {
  const { coupleEventQuery } = useCoupleEvent(token)
  const data = coupleEventQuery.data

  return (
    <Section className="py-6">
      <IntroModal />
      <Card>
        <CardHeader>
          <CardTitle>{data.event.eventName}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <SupplierList shareToken={token} />
        </CardContent>
      </Card>
    </Section>
  )
}

function CoupleEventSkeleton() {
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

