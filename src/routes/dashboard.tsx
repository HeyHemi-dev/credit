import { createFileRoute } from '@tanstack/react-router'
import React from 'react'
import { ActionDrawer } from '@/components/action-drawer'
import { CreateEventForm } from '@/components/events/create-event-form'
import {
  EventListItem,
  EventListItemSkeleton,
} from '@/components/events/event-list-item'
import {
  EventListStatus,
  EventListStatusSkeleton,
} from '@/components/events/event-list-status'
import { Section } from '@/components/ui/section'
import { useAuthToken } from '@/hooks/use-auth-token'
import { useEvents } from '@/hooks/use-events'
import { Button } from '@/components/ui/button'
import { AUTH_STATUS, AUTH_TOKEN_TYPE } from '@/lib/constants'
import { AuthState } from '@/components/auth-state'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const authToken = useAuthToken()
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const authUserId =
    authToken.status === AUTH_STATUS.AUTHENTICATED &&
    authToken.tokenType === AUTH_TOKEN_TYPE.SESSION_TOKEN
      ? authToken.authUserId
      : null

  return (
    <>
      <Section className="pb-24">
        {authUserId ? (
          <React.Suspense fallback={<EventListSkeleton />}>
            <EventList userId={authUserId} />
          </React.Suspense>
        ) : (
          <AuthState authToken={authToken} />
        )}
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
        {authUserId && (
          <CreateEventForm
            authUserId={authUserId}
            onSubmit={() => setDrawerOpen(false)}
            onCancel={() => setDrawerOpen(false)}
            containerRef={containerRef}
          />
        )}
      </ActionDrawer>
    </>
  )
}

function EventList({ userId }: { userId: string }) {
  const { getEventListQuery } = useEvents(userId)
  const events = getEventListQuery.data

  return (
    <>
      <EventListStatus activeEvents={events.length} />
      <div className="grid gap-4">
        {events.map((event) => (
          <EventListItem key={event.id} event={event} />
        ))}
      </div>
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
