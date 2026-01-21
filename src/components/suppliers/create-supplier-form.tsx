import { useForm } from '@tanstack/react-form'
import type { SupplierSearchResult } from '@/lib/types/front-end'
import type {
  AuthToken,
  CreateSupplierForm,
} from '@/lib/types/validation-schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { FieldGroup } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { REGIONS } from '@/lib/constants'
import { useCreateSupplier } from '@/hooks/use-suppliers'
import {
  createSupplierFormSchema,
  regionSchema,
} from '@/lib/types/validation-schema'
import { useBack } from '@/components/back-button'
import { useDedupe } from '@/hooks/use-dedupe'
import { emptyStringToNull } from '@/lib/empty-strings'

const defaultValues: CreateSupplierForm = {
  name: '',
  email: '',
  instagramHandle: '',
  tiktokHandle: '',
  region: '',
}

export function CreateSupplierForm({ authToken }: { authToken: AuthToken }) {
  const handleBack = useBack()
  const { dedupeQuery, setDedupeEmail, setDedupeName } = useDedupe()
  const dedupeCandidates = dedupeQuery.data ?? []
  const { createMutation } = useCreateSupplier(authToken)

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: createSupplierFormSchema,
    },

    onSubmit: () => {
      const values = form.state.values
      createMutation.mutate({
        ...values,
        region: emptyStringToNull(values.region),
      })
      handleBack()
    },
  })

  function handleAttach(supplierId: string) {
    handleBack()
  }

  return (
    <form
      id="create-supplier-form"
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      className="grid gap-9"
    >
      <FieldGroup className="grid gap-6">
        <form.Field
          name="name"
          children={(field) => (
            <FormField field={field} label="Supplier name" isRequired>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={() => setDedupeName(field.state.value)}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </FormField>
          )}
        />

        <form.Field
          name="email"
          children={(field) => (
            <FormField field={field} label="Email" isRequired>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={() => setDedupeEmail(field.state.value)}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </FormField>
          )}
        />

        <form.Field
          name="region"
          children={(field) => (
            <FormField field={field} label="Region">
              <Select
                value={field.state.value}
                onValueChange={(v) => {
                  const { data: region } = regionSchema.safeParse(v)
                  field.handleChange(region ?? '')
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {field.state.value ? field.state.value : 'Select region'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="none" value="">
                    -
                  </SelectItem>
                  {REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
        />

        <form.Field
          name="instagramHandle"
          children={(field) => (
            <FormField field={field} label="Instagram handle">
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="@supplier"
              />
            </FormField>
          )}
        />

        <form.Field
          name="tiktokHandle"
          children={(field) => (
            <FormField field={field} label="TikTok handle">
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="@supplier"
              />
            </FormField>
          )}
        />

        {dedupeCandidates.length > 0 && (
          <DedupeCandidates
            dedupeCandidates={dedupeCandidates}
            onClick={handleAttach}
          />
        )}
      </FieldGroup>
      <div className="flex justify-end">
        <Button
          type="submit"
          form="create-supplier-form"
          disabled={form.state.isSubmitting || createMutation.isPending}
        >
          {createMutation.isPending ? 'Creating…' : 'Create supplier'}
        </Button>
      </div>
      {createMutation.error?.message && (
        <div className="text-destructive">{createMutation.error.message}</div>
      )}
    </form>
  )
}

function DedupeCandidates({
  dedupeCandidates,
  onClick,
}: {
  dedupeCandidates: Array<SupplierSearchResult>
  onClick: (supplierId: string) => void
}) {
  return (
    <div className="grid gap-2">
      <div className="text-sm text-muted-foreground">
        Did you mean one of these?
      </div>
      {dedupeCandidates.map((supplier) => (
        <button
          key={supplier.id}
          className="rounded-xl border px-3 py-2 text-left hover:bg-muted/30"
          onClick={() => onClick(supplier.id)}
          type="button"
        >
          <div className="font-medium">{supplier.name}</div>
          <div className="text-xs text-muted-foreground">{supplier.email}</div>
        </button>
      ))}
    </div>
  )
}
