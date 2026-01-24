import { useForm } from '@tanstack/react-form'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon } from '@hugeicons/core-free-icons'
import { Card, CardContent } from '../ui/card'
import type { Supplier } from '@/lib/types/front-end'
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
import { AUTH_STATUS, REGIONS } from '@/lib/constants'
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

    onSubmit: async ({ value }) => {
      if (authToken.status !== AUTH_STATUS.AUTHENTICATED) return

      await createMutation.mutateAsync({
        ...value,
        instagramHandle: emptyStringToNull(value.instagramHandle),
        tiktokHandle: emptyStringToNull(value.tiktokHandle),
        region: emptyStringToNull(value.region),
      })
      handleBack()
    },
  })

  function handleDedupe(supplierId: string) {
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
                onChange={(event) => {
                  field.handleChange(
                    normalizeInstagramInput(event.target.value),
                  )
                }}
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
                onChange={(event) =>
                  field.handleChange(normalizeTiktokInput(event.target.value))
                }
                placeholder="@supplier"
              />
            </FormField>
          )}
        />

        {dedupeCandidates.length > 0 && (
          <DedupeCandidates
            dedupeCandidates={dedupeCandidates}
            onClick={handleDedupe}
          />
        )}
      </FieldGroup>
      <div className="flex justify-end">
        <Button
          type="submit"
          form="create-supplier-form"
          disabled={
            form.state.isSubmitting ||
            createMutation.isPending ||
            authToken.status === AUTH_STATUS.PENDING
          }
        >
          {createMutation.isPending ? 'Creating…' : 'Create supplier'}
        </Button>
      </div>
      {createMutation.error?.message && (
        <FormErrorMessage message={createMutation.error.message} />
      )}
    </form>
  )
}

function FormErrorMessage({ message }: { message: string }) {
  return (
    <Card className="bg-destructive/5 text-destructive ring-destructive/10">
      <CardContent className="grid grid-cols-[auto_1fr] gap-2">
        <HugeiconsIcon icon={Alert02Icon} className="size-4" />
        <span>{message}</span>
      </CardContent>
    </Card>
  )
}

function DedupeCandidates({
  dedupeCandidates,
  onClick,
}: {
  dedupeCandidates: Array<Supplier>
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

function normalizeInstagramInput(input: string) {
  if (input.startsWith('https://www.instagram.com/')) {
    input = input.replace('https://www.instagram.com/', '@')
  }
  if (input.endsWith('/')) {
    input = input.slice(0, -1)
  }
  return input
}

function normalizeTiktokInput(input: string) {
  if (input.startsWith('https://www.tiktok.com/')) {
    input = input.replace('https://www.tiktok.com/', '@')
  }
  if (input.endsWith('/')) {
    input = input.slice(0, -1)
  }
  return input
}
