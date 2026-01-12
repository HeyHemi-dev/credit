import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getEventSuppliersForCoupleFn } from '@/lib/server/event-suppliers'
import { Section } from '@/components/ui/section'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IntroModal } from '@/components/couple/IntroModal'
import { SupplierList } from '@/components/couple/SupplierList'

export const Route = createFileRoute('/couple/$token')({
  component: CoupleEvent,
})

function CoupleEvent() {
  const { token } = Route.useParams()

  const dataQuery = useQuery({
    queryKey: ['coupleEvent', token],
    queryFn: async () => await getEventSuppliersForCoupleFn({ data: { shareToken: token } }),
  })

  return (
    <Section className="py-6">
      <IntroModal />

      {dataQuery.isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading…</CardTitle>
          </CardHeader>
        </Card>
      ) : dataQuery.isError ? (
        <Card>
          <CardHeader>
            <CardTitle>Invalid link</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            This link doesn’t look right.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{dataQuery.data.event.eventName}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <SupplierList shareToken={token} />
          </CardContent>
        </Card>
      )}
    </Section>
  )
}

