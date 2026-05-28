import type { Supplier } from '@/lib/types/front-end'
import { OptionalDetail } from '@/components/ui/optional-detail'

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
        <OptionalDetail value={supplier.region} prefix="Based in " />
        <OptionalDetail label="Regions served" value={supplier.regionsServed} />
        <OptionalDetail label="Services" value={supplier.services} />
        <OptionalDetail label="Website" value={supplier.website} />
        <OptionalDetail
          label="Instagram"
          value={supplier.instagramHandle}
          prefix="@"
        />
        <OptionalDetail
          label="TikTok"
          value={supplier.tiktokHandle}
          prefix="@"
        />
      </div>
    </div>
  )
}
