import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { FieldGroup } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { REGION, REGION_KEYS, SERVICE, SERVICE_KEYS } from '@/lib/constants'
import {
  createSupplierInputSchema,
  serviceSchema,
} from '@/lib/validations'
import { emptyStringToNull } from '@/lib/empty-strings'
import { queryKeys } from '@/hooks/query-keys'
import { searchSuppliersForCoupleFn } from '@/lib/server/suppliers'
import { useCreateSupplierForCouple } from '@/hooks/use-suppliers'

const createSupplierFormSchema = createSupplierInputSchema.extend({
  service: serviceSchema,
})

type CreateSupplierFormValues = {
  name: string
  email: string
  service: string
  instagramHandle: string
  tiktokHandle: string
  region: string
}

const defaultValues: CreateSupplierFormValues = {
  name: '',
  email: '',
  service: '',
  instagramHandle: '',
  tiktokHandle: '',
  region: '',
}

export function CreateSupplierForm({
  eventId,
  containerRef,
  defaultRegion,
  onComplete,
}: {
  eventId: string
  containerRef?: React.RefObject<HTMLDivElement | null>
  defaultRegion?: string | null
  onComplete: () => void
}) {
  const [step, setStep] = React.useState<'form' | 'dedupe'>('form')
  const searchSuppliers = useServerFn(searchSuppliersForCoupleFn)
  const { createMutation, attachExistingMutation } =
    useCreateSupplierForCouple(eventId)

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: createSupplierFormSchema,
    },
    onSubmit: async () => {
      setStep('dedupe')
    },
  })

  React.useEffect(() => {
    if (defaultRegion && !form.state.values.region) {
      form.setFieldValue('region', defaultRegion)
    }
  }, [defaultRegion, form])

  const dedupeQuery = useSuspenseQuery({
    queryKey: queryKeys.supplierDedupe(
      eventId,
      form.state.values.name,
      form.state.values.email,
    ),
    queryFn: async () => {
      if (step !== 'dedupe') return []
      const q = form.state.values.name.trim() || form.state.values.email.trim()
      if (!q) return []
      return await searchSuppliers({ data: { eventId, query: q } })
    },
  })

  const handleCreate = () => {
    const values = form.state.values
    createMutation.mutate(
      {
        supplier: {
          name: values.name.trim(),
          email: values.email.trim(),
          instagramHandle: emptyStringToNull(values.instagramHandle),
          tiktokHandle: emptyStringToNull(values.tiktokHandle),
          region: emptyStringToNull(values.region),
        },
        service: values.service,
      },
      { onSuccess: onComplete },
    )
  }

  const handleAttach = (supplierId: string) => {
    const values = form.state.values
    attachExistingMutation.mutate(
      { supplierId, service: values.service },
      { onSuccess: onComplete },
    )
  }

  return (
    <form
      id="create-supplier-form"
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup>
        {step === 'form' ? (
          <>
            <form.Field
              name="name"
              children={(field) => (
                <FormField field={field} label="Supplier name">
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </FormField>
              )}
            />

            <form.Field
              name="email"
              children={(field) => (
                <FormField field={field} label="Email">
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </FormField>
              )}
            />

            <form.Field
              name="service"
              children={(field) => (
                <FormField field={field} label="Service">
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent container={containerRef}>
                      {SERVICE_KEYS.map((key) => (
                        <SelectItem key={key} value={SERVICE[key]}>
                          {SERVICE[key]}
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
                <FormField field={field} label="Instagram handle (optional)">
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
                <FormField field={field} label="TikTok handle (optional)">
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
              name="region"
              children={(field) => (
                <FormField field={field} label="Region (optional)">
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent container={containerRef}>
                      {REGION_KEYS.map((key) => (
                        <SelectItem key={key} value={REGION[key]}>
                          {REGION[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />

            <Button
              type="submit"
              form="create-supplier-form"
              disabled={form.state.isSubmitting}
            >
              Continue
            </Button>
          </>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Did you mean one of these?
            </div>

            {dedupeQuery.data?.length ? (
              <div className="grid gap-2">
                {dedupeQuery.data.slice(0, 6).map((supplier) => (
                  <button
                    key={supplier.id}
                    className="text-left rounded-xl border px-3 py-2 hover:bg-muted/30"
                    onClick={() => handleAttach(supplier.id)}
                    type="button"
                  >
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {supplier.email}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <Card size="sm">
                <CardContent className="text-sm text-muted-foreground">
                  No close matches.
                </CardContent>
              </Card>
            )}

            <div className="grid gap-2 pt-2">
              <Button
                type="button"
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending
                  ? 'Creating…'
                  : 'No, create new supplier'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setStep('form')}>
                Back
              </Button>
            </div>
          </>
        )}

        {createMutation.isError ? (
          <div className="text-sm text-destructive">
            Couldn’t create supplier.
          </div>
        ) : null}
      </FieldGroup>
    </form>
  )
}
