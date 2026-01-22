import { createFileRoute } from '@tanstack/react-router'
import React from 'react'
import { RedirectToSignIn } from '@neondatabase/neon-js/auth/react/ui'
import { RouteError } from '@/components/route-error'
import { Main, Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { CreateEventDrawer } from '@/components/events/create-event-drawer'
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
  const { getEventListQuery } = useEvents(userId)
  const [createOpen, setCreateOpen] = React.useState(false)
  const events = getEventListQuery.data

  return (
    <>
      <Section>
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
