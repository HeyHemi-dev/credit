import { useForm } from '@tanstack/react-form'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon } from '@hugeicons/core-free-icons'
import React from 'react'
import type { Supplier } from '@/lib/types/front-end'
import type {
  AuthToken,
  CreateSupplierForm,
} from '@/lib/types/validation-schema'
import { Card, CardContent } from '@/components/ui/card'
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
import { cn } from '@/lib/utils'

const defaultValues: CreateSupplierForm = {
  name: '',
  email: '',
  instagramHandle: '',
  tiktokHandle: '',
  region: '',
}

export function CreateSupplierForm({ authToken }: { authToken: AuthToken }) {
  const handleBack = useBack()

  // TODO: check why dedupe is not working

  const { dedupeQuery, setDedupeEmail, setDedupeName } = useDedupe()
  const dedupeCandidates = dedupeQuery.data ?? []
  const [selectedCandidate, setSelectedCandidate] = React.useState<
    string | null
  >(null)

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
            <FormField field={field} label="Name" isRequired>
              <Input
                id={field.name}
                placeholder="Business name"
                value={field.state.value}
                onBlur={() => {}}
                onChange={(event) => {
                  field.handleChange(event.target.value)
                  setDedupeName(event.target.value)
                }}
              />
            </FormField>
          )}
        />

        <form.Field
          name="email"
          children={(field) => (
            <FormField
              field={field}
              label="Contact email"
              description="Used for crediting and deduping. Not shown publicly."
              isRequired
            >
              <Input
                id={field.name}
                placeholder="Email address"
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
            <FormField
              field={field}
              label="Based in"
              description="Optional, helps match suppliers correctly."
            >
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
            <FormField
              field={field}
              label="Instagram handle"
              description="If you know it."
            >
              <Input
                id={field.name}
                value={field.state.value}
                placeholder="@supplier"
                onChange={(event) => {
                  field.handleChange(
                    normalizeInstagramInput(event.target.value),
                  )
                }}
              />
            </FormField>
          )}
        />

        <form.Field
          name="tiktokHandle"
          children={(field) => (
            <FormField
              field={field}
              label="TikTok handle"
              description="If you know it."
            >
              <Input
                id={field.name}
                value={field.state.value}
                placeholder="@supplier"
                onChange={(event) =>
                  field.handleChange(normalizeTiktokInput(event.target.value))
                }
              />
            </FormField>
          )}
        />
      </FieldGroup>

      {dedupeCandidates.length > 0 && (
        <DedupeCandidates
          dedupeCandidates={dedupeCandidates}
          selectedCandidate={selectedCandidate}
          setSelectedCandidate={(supplierId) =>
            setSelectedCandidate(supplierId)
          }
        />
      )}

      <div className="grid gap-2">
        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            form="create-supplier-form"
            disabled={
              form.state.isSubmitting ||
              createMutation.isPending ||
              authToken.status === AUTH_STATUS.PENDING ||
              selectedCandidate !== null
            }
          >
            {createMutation.isPending ? 'Creating…' : 'Create supplier'}
          </Button>
          {dedupeCandidates.length > 0 && (
            <Button
              className="order-first"
              variant="default"
              onClick={handleBack}
              disabled={selectedCandidate === null}
            >
              Use existing
            </Button>
          )}
        </div>
        <p className="text-right text-xs text-muted-foreground/60">
          Please double-check spelling —this is shared with others.
        </p>
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
  selectedCandidate,
  setSelectedCandidate,
}: {
  dedupeCandidates: Array<Supplier>
  selectedCandidate: string | null
  setSelectedCandidate: (supplierId: string | null) => void
}) {
  function handleClick(supplierId: string) {
    if (selectedCandidate === supplierId) {
      setSelectedCandidate(null)
    } else {
      setSelectedCandidate(supplierId)
    }
  }

  return (
    <Card className="bg-primary/5 ring-primary/10">
      <CardContent className="grid gap-4">
        <div className="grid gap-0.5">
          <h2 className="font-medium text-primary">
            We found some similar suppliers.
          </h2>
          <p className="text-sm text-muted-foreground">
            Did you mean one of these?
          </p>
        </div>

        <div className="grid gap-2">
          <div className="flex flex-wrap">
            {dedupeCandidates.map((supplier) => (
              <Button
                key={supplier.id}
                variant="outline"
                className={cn(
                  'flex h-auto flex-col items-start gap-0.5 self-start rounded-xl px-4 py-2 text-left !normal-case',
                  selectedCandidate === supplier.id &&
                    'border-primary bg-primary/10',
                )}
                onClick={() => handleClick(supplier.id)}
                type="button"
              >
                <p>
                  <span className="font-medium">{supplier.name}</span>
                  {supplier.region && (
                    <span className="font-light">{` • ${supplier.region}`}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {supplier.email}
                </p>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
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
