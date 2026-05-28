import type { Supplier } from '@/lib/types/front-end'

export function ClaimSupplierSummary({
  supplier,
}: {
  supplier: Supplier
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
      <div className="grid gap-1 text-sm">
        <p className="font-medium">{supplier.name}</p>
        <p className="text-muted-foreground">{supplier.email}</p>
        {supplier.region && (
          <p className="text-muted-foreground">Based in {supplier.region}</p>
        )}
        {supplier.regionsServed.length > 0 && (
          <p className="text-muted-foreground">
            Regions served: {supplier.regionsServed.join(', ')}
          </p>
        )}
        {supplier.services.length > 0 && (
          <p className="text-muted-foreground">
            Services: {supplier.services.join(', ')}
          </p>
        )}
        {supplier.website && (
          <p className="text-muted-foreground">Website: {supplier.website}</p>
        )}
        {supplier.instagramHandle && (
          <p className="text-muted-foreground">
            Instagram: @{supplier.instagramHandle}
          </p>
        )}
        {supplier.tiktokHandle && (
          <p className="text-muted-foreground">TikTok: @{supplier.tiktokHandle}</p>
        )}
      </div>
    </div>
  )
}
