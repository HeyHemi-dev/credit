import { createFileRoute } from '@tanstack/react-router'
import React from 'react'
import { RedirectToSignIn } from '@neondatabase/neon-js/auth/react/ui'
import { RouteError } from '@/components/route-error'
import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { ActionDrawer } from '@/components/action-drawer'
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
import { CreateEventForm } from '@/components/events/create-event-form'

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
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const { getEventListQuery } = useEvents(userId)
  const events = getEventListQuery.data

  return (
    <>
      <Section className="pb-24">
        <EventListStatus activeEvents={events.length} />
        <div className="grid gap-4">
          {events.map((event) => (
            <EventListItem key={event.id} event={event} />
          ))}
        </div>
      </Section>

      <div className="fixed bottom-6 left-1/2 z-10 -translate-x-1/2">
        <Button
          className="h-auto border-2 border-primary/20 px-8 py-4 shadow-xl shadow-primary/20"
          onClick={() => setDrawerOpen(true)}
        >
          New event
        </Button>
      </div>

      <ActionDrawer
        state={{ isOpen: drawerOpen, setIsOpen: setDrawerOpen }}
        content={{ title: 'Create Event' }}
        setContainerRef={containerRef}
      >
        <CreateEventForm authUserId={userId} containerRef={containerRef} />
      </ActionDrawer>
    </>
  )
}

function EventListSkeleton() {
  return (
    <Section>
      <EventListStatusSkeleton />
      <div className="grid gap-4">
        <EventListItemSkeleton />
        <EventListItemSkeleton />
      </div>
    </Section>
  )
}
