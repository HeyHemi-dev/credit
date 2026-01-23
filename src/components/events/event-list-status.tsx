import { Card, CardContent } from '@/components/ui/card'

import { Skeleton } from '@/components/ui/skeleton'

export function EventListStatus({ activeEvents }: { activeEvents: number }) {
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

export function EventListStatusSkeleton() {
  return <Skeleton className="w-full h-32" />
}
