import { Link, useRouter } from '@tanstack/react-router'
import type { EventListItem } from '@/lib/types/front-end'

import type { AuthToken } from '@/lib/types/validation-schema'
import { Skeleton } from '@/components/ui/skeleton'
import { CopyButton } from '@/components/copy-button'
import { useClipboard } from '@/hooks/use-clipboard'
import { useEvents } from '@/hooks/use-events'

import {
  EventListStatus,
  EventListStatusSkeleton,
} from '@/components/events/event-list-status'
import { Section } from '@/components/ui/section'

export function EventList({ authToken }: { authToken: AuthToken }) {
  const { getEventListQuery } = useEvents(authToken)
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

export function EventListSkeleton() {
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

export function EventListItem({ event }: { event: EventListItem }) {
  const { isCopied, copy } = useClipboard()
  const router = useRouter()
  const location = router.buildLocation({
    to: '/e/$eventId',
    params: { eventId: event.id },
    search: { shareToken: event.shareToken },
  })
  const shareLink = location.url.toString()

  return (
    <div className="grid grid-cols-[1fr_1px_auto] items-center gap-2">
      <Link
        to="/events/$eventId"
        params={{ eventId: event.id }}
        className="grid gap-1 rounded-xl p-4 hover:bg-muted"
      >
        <div className="font-medium">{event.eventName}</div>
        <div className="text-sm text-muted-foreground">
          {event.weddingDate}
          {event.supplierCount > 0 && ` • ${event.supplierCount} tags`}
        </div>
      </Link>
      <div className="h-full max-h-8 border-r border-border"></div>
      <CopyButton
        variant="ghost"
        className="text-primary hover:bg-muted hover:text-primary"
        labels={{
          idle: 'Share',
          copied: 'Copied',
        }}
        isCopied={isCopied}
        onClick={(e) => {
          e.stopPropagation()
          copy(shareLink)
        }}
      />
    </div>
  )
}

export function EventListItemSkeleton() {
  return <Skeleton className="h-24 w-full" />
}
