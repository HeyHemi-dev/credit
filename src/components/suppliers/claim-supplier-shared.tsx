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
        {renderOptionalDetail({ value: supplier.region, prefix: 'Based in ' })}
        {renderOptionalDetail({
          label: 'Regions served',
          value: supplier.regionsServed,
        })}
        {renderOptionalDetail({
          label: 'Services',
          value: supplier.services,
        })}
        {renderOptionalDetail({
          label: 'Website',
          value: supplier.website,
        })}
        {renderOptionalDetail({
          label: 'Instagram',
          value: supplier.instagramHandle,
          prefix: '@',
        })}
        {renderOptionalDetail({
          label: 'TikTok',
          value: supplier.tiktokHandle,
          prefix: '@',
        })}
      </div>
    </div>
  )
}

function renderOptionalDetail({
  label,
  prefix,
  value,
}: {
  label?: string
  prefix?: string
  value: string | Array<string> | null | undefined
}) {
  const content = Array.isArray(value) ? value.join(', ') : value
  if (!content) return null

  return (
    <p className="text-muted-foreground">
      {label ? `${label}: ` : ''}
      {prefix ?? ''}
      {content}
    </p>
  )
}
