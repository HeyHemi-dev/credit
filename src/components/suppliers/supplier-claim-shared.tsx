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
