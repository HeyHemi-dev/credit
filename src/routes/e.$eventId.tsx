import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons'
import type { AuthToken } from '@/lib/types/validation-schema'
import { RouteError } from '@/components/route-error'
import { Section } from '@/components/ui/section'

import { IntroModal } from '@/components/credit/intro-modal'
import { Skeleton } from '@/components/ui/skeleton'
import { useCredits } from '@/hooks/use-credits'
import {
  CreditListItem,
  CreditListItemSkeleton,
} from '@/components/credit/credit-list'

import { shareTokenSchema } from '@/lib/types/validation-schema'
import { Button } from '@/components/ui/button'
import { ActionDrawer } from '@/components/action-drawer'
import { CreateCreditForm } from '@/components/credit/create-credit-form'
import { requireShareAuthToken, useAuthToken } from '@/hooks/use-auth-token'

const creditListRouteSearchSchema = z.object({
  shareToken: shareTokenSchema,
})

export const Route = createFileRoute('/e/$eventId')({
  ssr: false,
  component: RouteComponent,
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
  validateSearch: creditListRouteSearchSchema,
})

function RouteComponent() {
  const { eventId } = Route.useParams()
  const { shareToken } = Route.useSearch()
  const authToken = useAuthToken(shareToken)
  const shareAuth = requireShareAuthToken(authToken)

  return (
    <React.Suspense fallback={<EventCreditPageSkeleton />}>
      <EventCreditPage eventId={eventId} authToken={shareAuth} />
    </React.Suspense>
  )
}

export function EventCreditPage({
  eventId,
  authToken,
}: {
  eventId: string
  authToken: AuthToken
}) {
  const shareAuth = requireShareAuthToken(authToken)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const { getEventForCoupleQuery } = useCredits(eventId, shareAuth.token)
  const event = getEventForCoupleQuery.data

  // TODO: add event done checkbox (consider using eventStatus enum with open, submitted, and locked)
  // TODO: write drawer open state to url search params

  return (
    <>
      <IntroModal />

      <Section>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-light">
            <span className="text-muted-foreground">Event: </span>
            <span className="font-light">{event.eventName}</span>
          </h1>
          <p className="text-pretty text-muted-foreground">
            Please list the suppliers you used, so we can accurately credit
            them.
          </p>
        </div>
        <div className="grid gap-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-light">Supplier List</h2>
            <Button onClick={() => setDrawerOpen(true)}>
              <HugeiconsIcon icon={Search01Icon} />
              <span>Add Supplier</span>
            </Button>
          </div>

          {event.credits.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              <p>No suppliers yet.</p>
              <Button variant={'link'} onClick={() => setDrawerOpen(true)}>
                Add one now
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {event.credits.map((credit) => (
                <CreditListItem
                  key={credit.id}
                  credit={credit}
                  eventId={eventId}
                  shareToken={shareAuth.token}
                />
              ))}
            </div>
          )}
        </div>
      </Section>

      <ActionDrawer
        state={{ isOpen: drawerOpen, setIsOpen: setDrawerOpen }}
        content={{ title: 'Credit Supplier' }}
        setContainerRef={containerRef}
      >
        <CreateCreditForm
          eventId={eventId}
          shareToken={shareAuth.token}
          onSubmit={() => setDrawerOpen(false)}
          onCancel={() => setDrawerOpen(false)}
          containerRef={containerRef}
        />
      </ActionDrawer>
    </>
  )
}

function EventCreditPageSkeleton() {
  return (
    <Section>
      <Skeleton className="h-14 w-full" />

      <CreditListItemSkeleton />
      <CreditListItemSkeleton />
      <CreditListItemSkeleton />
    </Section>
  )
}
