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
    <div className="grid grid-cols-[1fr_auto] gap-4">
      <div>
        <p className="font-medium">{credit.name}</p>
        <p className="text-muted-foreground text-sm">
          <span>{credit.service}</span>
          {credit.contributionNotes && (
            <span>• {credit.contributionNotes}</span>
          )}
        </p>
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
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-1/2 h-4" />
      </div>
      <Skeleton className="size-9" />
    </div>
  )
}
