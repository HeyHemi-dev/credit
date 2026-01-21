import * as React from 'react'
import { useRouter } from '@tanstack/react-router'
import type { EventListItem } from '@/lib/types/front-end'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { isServer } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export function EventListItem({
  event,
  handleClick,
}: {
  event: EventListItem
  handleClick: (eventId: string) => void
}) {
  const [copied, setCopied] = React.useState(false)
  const router = useRouter()

  const copyLink = async (shareToken: string) => {
    if (isServer) return
    const location = router.buildLocation({
      to: '/e/$eventId',
      params: { eventId: event.id },
      search: { shareToken },
    })
    await navigator.clipboard.writeText(location.url.toString())
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
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
            {copied ? 'Copied' : 'Copy link'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function EventListItemSkeleton() {
  return <Skeleton className="w-full h-24" />
}
