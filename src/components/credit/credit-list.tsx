import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon } from '@hugeicons/core-free-icons'
import type { EventSupplier } from '@/lib/types/front-end'
import { useEventCredits } from '@/hooks/use-event-credit'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function CreditListItem({
  credit,
  eventId,
  shareToken,
}: {
  credit: EventSupplier
  eventId: string
  shareToken: string
}) {
  const { DeleteCreditMutation } = useEventCredits(eventId, shareToken)

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4">
      <div>
        <p>
          <span className="text-sm text-muted-foreground">{`${credit.service} • `}</span>
          <span className="font-medium">{credit.name}</span>
        </p>
        {credit.contributionNotes && (
          <p className="text-sm text-muted-foreground">
            • {credit.contributionNotes}
          </p>
        )}
      </div>
      <Button
        variant={'ghost'}
        size={'icon'}
        onClick={() => DeleteCreditMutation.mutate({ supplierId: credit.id })}
      >
        <HugeiconsIcon icon={Delete02Icon} />
      </Button>
    </div>
  )
}

export function CreditListItemSkeleton() {
  return (
    <div>
      <div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="size-9" />
    </div>
  )
}
