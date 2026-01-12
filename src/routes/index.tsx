import { ErrorComponent, createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { RedirectToSignIn } from '@neondatabase/neon-js/auth/react/ui'
import type { ErrorComponentProps } from '@tanstack/react-router'

import type { EventListItem } from '@/lib/types/front-end'
import { Main, Section } from '@/components/ui/section'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SHARE_LINK } from '@/lib/constants'
import { CreateEventDrawer } from '@/components/events/CreateEventDrawer'
import { EventDetailDrawer } from '@/components/events/EventDetailDrawer'
import { useEvents } from '@/hooks/use-events'

import { isServer } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/auth'

export const Route = createFileRoute('/')({
  ssr: false,
  component: Dashboard,
  errorComponent: ({ error, reset }) => (
    <EventListError error={error} reset={reset} />
  ),
})

function Dashboard() {
  const { data, isPending } = authClient.useSession()
  console.log(data)

  if (isPending) {
    return <EventListSkeleton />
  }

  if (!isPending && !data) {
    return <RedirectToSignIn />
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
        <StatusCard activeEvents={events.length} />
        <div className="grid gap-4">
          {events.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              handleClick={setSelectedEventId}
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
      <EventDetailDrawer
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open)
          if (!open) setSelectedEventId(null)
        }}
        eventId={selectedEventId}
      />
      <CreateEventDrawer open={createOpen} onOpenChange={setCreateOpen} />
    </Main>
  )
}

function EventItem({
  event,
  handleClick,
}: {
  event: EventListItem
  handleClick: (eventId: string) => void
}) {
  const copyLink = async (shareToken: string) => {
    if (isServer) return
    const url = `${window.location.origin}${SHARE_LINK.PATH_PREFIX}/${shareToken}`
    await navigator.clipboard.writeText(url)
  }

  return (
    <Card key={event.id} size="sm">
      <CardContent
        className="grid gap-2 cursor-pointer"
        onClick={() => {
          handleClick(event.id)
        }}
      >
        <div className="grid grid-cols-[1fr_auto] items-start gap-3">
          <div className="grid gap-1">
            <div className="font-medium">{event.eventName}</div>
            <div className="text-muted-foreground text-sm">
              {event.weddingDate}
              {event.supplierCount > 0 && ` • ${event.supplierCount} credits`}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              void copyLink(event.shareToken)
            }}
          >
            Copy link
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
function EventListSkeleton() {
  return (
    <Main>
      <Section>
        <StatusCardSkeleton />
        <div className="grid gap-4">
          <Skeleton className="w-full h-24" />
          <Skeleton className="w-full h-24" />
        </div>
      </Section>
    </Main>
  )
}
function EventListError({ error, reset }: ErrorComponentProps) {
  return (
    <Main>
      <Section>
        <ErrorComponent error={error} />
        <Button variant="outline" onClick={reset}>
          Retry
        </Button>
      </Section>
    </Main>
  )
}

function StatusCard({ activeEvents }: { activeEvents: number }) {
  return (
    <Card className="bg-primary/5 ring-primary/10">
      <CardContent className="grid gap-1">
        <h2 className="font-medium text-primary">Events Overview</h2>
        <p className="text-2xl font-extralight">{`${activeEvents} active events`}</p>
        <p className="text-muted-foreground text-sm">
          Manage your events and suppliers
        </p>
      </CardContent>
    </Card>
  )
}

function StatusCardSkeleton() {
  return <Skeleton className="w-full h-32" />
}
