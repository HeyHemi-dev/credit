import { Link, useRouter } from '@tanstack/react-router'
import type { EventListItem } from '@/lib/types/front-end'

import { Skeleton } from '@/components/ui/skeleton'
import { CopyButton } from '@/components/copy-button'
import { useClipboard } from '@/hooks/use-clipboard'

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
          {event.supplierCount > 0 && ` • ${event.supplierCount} credits`}
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
