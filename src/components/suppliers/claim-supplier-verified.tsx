import { useNavigate } from '@tanstack/react-router'
import type { Supplier } from '@/lib/types/front-end'
import { useSupplierClaim } from '@/hooks/use-supplier-claims'
import { Button } from '@/components/ui/button'
import { FormErrorMessage } from '@/components/ui/form-error-message'

export function ClaimSupplierVerified({ supplier }: { supplier: Supplier }) {
  const { archiveClaimMutation } = useSupplierClaim()
  const navigate = useNavigate()

  return (
    <div className="grid gap-12">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-sm text-muted-foreground">
          Stop managing this profile:
        </p>
        <div>
          <Button
            type="button"
            variant="link"
            className="h-auto px-0 text-sm"
            onClick={() => archiveClaimMutation.mutate()}
            disabled={archiveClaimMutation.isPending}
          >
            {archiveClaimMutation.isPending
              ? 'Disconnecting…'
              : `Disconnect ${supplier.name}`}
          </Button>
        </div>
      </div>

      {archiveClaimMutation.error?.message && (
        <FormErrorMessage message={archiveClaimMutation.error.message} />
      )}

      <div className="grid gap-6">
        <div className="grid gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
          <div className="grid gap-1 text-sm">
            <p className="font-medium">{supplier.name}</p>
            <p className="text-muted-foreground">{supplier.email}</p>
            {renderOptionalDetail({
              label: 'Based in',
              value: supplier.region,
            })}
            {renderOptionalDetail({
              label: 'Serves',
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
              value: supplier.instagramHandle && `@${supplier.instagramHandle}`,
            })}
            {renderOptionalDetail({
              label: 'TikTok',
              value: supplier.tiktokHandle && `@${supplier.tiktokHandle}`,
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => navigate({ to: '/account/edit-profile' })}
          >
            Edit supplier profile
          </Button>
        </div>
      </div>
    </div>
  )
}

function renderOptionalDetail({
  label,
  value,
}: {
  label?: string
  value: string | Array<string> | null | undefined
}) {
  const content = Array.isArray(value) ? value.join(', ') : value
  if (!content) return null

  return (
    <p className="text-muted-foreground">
      {label ? `${label}: ` : ''}
      {content}
    </p>
  )
}
