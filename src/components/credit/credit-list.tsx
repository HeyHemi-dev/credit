import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon } from '@hugeicons/core-free-icons'
import type { Credit } from '@/lib/types/front-end'
import { useCredit } from '@/hooks/use-credits'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCreditContext } from '@/contexts/credit-page-context'

export function CreditListItem({ credit }: { credit: Credit }) {
  const { eventId, authToken } = useCreditContext()
  const { deleteCreditMutation } = useCredit(eventId, credit.id, authToken)

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4">
      <div className="grid gap-0.5">
        <p>
          <span className="text-foreground">{`${credit.service} • `}</span>
          <span className="font-medium">{credit.name}</span>
        </p>
        {credit.contributionNotes && (
          <p className="text-sm text-muted-foreground">
            {credit.contributionNotes}
          </p>
        )}
      </div>
      <Button
        variant={'ghost'}
        size={'icon'}
        onClick={() => deleteCreditMutation.mutate()}
      >
        <HugeiconsIcon icon={Delete02Icon} />
      </Button>
    </div>
  )
}

export function CreditListItemSkeleton() {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4">
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="size-9" />
    </div>
  )
}
