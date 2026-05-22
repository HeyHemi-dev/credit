import { Alert02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { Supplier } from '@/lib/types/front-end'

export function ClaimStateMessage({
  title,
  description,
  supplier,
}: {
  title: string
  description: string
  supplier: Supplier
}) {
  return (
    <div className="grid gap-2 rounded-2xl border border-border/60 bg-muted/30 p-4">
      <div className="grid gap-0.5">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-0.5 text-sm">
        <p className="font-medium">{supplier.name}</p>
        <p className="text-muted-foreground">{supplier.email}</p>
        {supplier.region && (
          <p className="text-muted-foreground">Based in {supplier.region}</p>
        )}
      </div>
    </div>
  )
}

// TODO: consider if this should be generic and used in other forms (if so, move to generic place)
export function FormErrorMessage({ message }: { message: string }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-2 rounded-2xl bg-destructive/5 p-4 text-destructive ring-1 ring-destructive/10">
      <HugeiconsIcon icon={Alert02Icon} className="size-4" />
      <span>{message}</span>
    </div>
  )
}
