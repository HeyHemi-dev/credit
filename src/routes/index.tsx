import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { RedirectToSignIn } from '@neondatabase/neon-js/auth/react/ui'
import { RouteError } from '@/components/ui/route-error'
import { Main, Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { CreateEventDrawer } from '@/components/events/create-event-drawer'
import { EventDetailDrawer } from '@/components/events/EventDetailDrawer'
import { useEvents } from '@/hooks/use-events'
import {
  EventListStatus,
  EventListStatusSkeleton,
} from '@/components/events/event-list-status'

import { authClient } from '@/auth'
import {
  EventListItem,
  EventListItemSkeleton,
} from '@/components/events/event-list-item'

export const Route = createFileRoute('/')({
  ssr: false,
  component: Dashboard,
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
})

function Dashboard() {
  const { data, isPending } = authClient.useSession()

  if (isPending) {
    return <EventListSkeleton />
  }

  if (!data) {
    return <RedirectToSignIn />
  }

  return (
    <React.Suspense fallback={<EventListSkeleton />}>
      <EventList userId={data.session.userId} />
    </React.Suspense>
  )
}

function EventList({ userId }: { userId: string }) {
  const { eventsQuery } = useEvents(userId)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(
    null,
  )
  const events = eventsQuery.data

  return (
    <Main>
      <Section>
        <EventListStatus activeEvents={events.length} />
        <div className="grid gap-4">
          {events.map((event) => (
            <EventListItem
              key={event.id}
              event={event}
              handleClick={(eventId) => {
                setSelectedEventId(eventId)
                setDetailOpen(true)
              }}
            />
          ))}
        </div>
      </Section>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10">
        <Button
          className="px-8 py-4 h-auto shadow-xl shadow-primary/20 border-primary/20 border-2"
          onClick={() => setCreateOpen(true)}
        >
          New event
        </Button>
      </div>

      <CreateEventDrawer
        authUserId={userId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <EventDetailDrawer
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open)
          if (!open) setSelectedEventId(null)
        }}
        eventId={selectedEventId}
        authUserId={userId}
      />
    </Main>
  )
}

function EventListSkeleton() {
  return (
    <Main>
      <Section>
        <EventListStatusSkeleton />
        <div className="grid gap-4">
          <EventListItemSkeleton />
          <EventListItemSkeleton />
        </div>
      </Section>
    </Main>
  )
}
