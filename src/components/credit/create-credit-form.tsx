import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import type { CreateCreditForm } from '@/lib/types/validation-schema'

import type { Service } from '@/lib/constants'
import { FieldGroup } from '@/components/ui/field'
import { createCreditFormSchema } from '@/lib/types/validation-schema'
import { SERVICES } from '@/lib/constants'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField } from '@/components/ui/form-field'
import { useCredits } from '@/hooks/use-credits'
import { Button } from '@/components/ui/button'
import { SupplierSearchCombobox } from '@/components/credit/supplier-search-combobox'
import { Textarea } from '@/components/ui/textarea'

const defaultValues: CreateCreditForm = {
  service: '' as Service,
  // cast type since we want this field to be empty initially,
  // but required on submission
  supplierId: '',
  contributionNotes: '',
}

export function CreateCreditForm({
  eventId,
  shareToken,
  onSubmit,
  onCancel,
  containerRef,
}: {
  eventId: string
  shareToken: string
  onSubmit: () => void
  onCancel: () => void
  containerRef?: React.RefObject<HTMLDivElement | null>
}) {
  const { createCreditMutation } = useCredits(eventId, shareToken)

  const form = useForm({
    defaultValues: defaultValues,
    validators: {
      onSubmit: createCreditFormSchema,
    },
    onSubmit: async ({ value }) => {
      await createCreditMutation.mutateAsync({
        service: value.service,
        supplierId: value.supplierId,
        contributionNotes: value.contributionNotes,
      })
      onSubmit()
    },
  })

  return (
    <form
      id="create-event-credit-form"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="grid gap-9"
    >
      <FieldGroup className="grid gap-6">
        <form.Field
          name="service"
          children={(field) => (
            <FormField field={field} label="Service" isRequired={true}>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  if (!value) return
                  field.handleChange(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue>
                    {field.state.value ? field.state.value : 'Select service'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent container={containerRef}>
                  {SERVICES.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
        />

        <form.Field
          name="supplierId"
          children={(field) => (
            <FormField field={field} label="Supplier" isRequired={true}>
              <SupplierSearchCombobox
                shareToken={shareToken}
                eventId={eventId}
                handleChange={(supplierId) => field.handleChange(supplierId)}
                containerRef={containerRef}
              />
            </FormField>
          )}
        />

        <form.Field
          name="contributionNotes"
          children={(field) => (
            <FormField
              field={field}
              label="Contribution notes"
              isRequired={false}
            >
              <Textarea
                id={field.name}
                value={field.state.value}
                placeholder="Anything to add? Say it here..."
                onChange={(e) => field.handleChange(e.target.value)}
                className="min-h-24"
              />
            </FormField>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          type="button"
          onClick={() => onCancel()}
          disabled={form.state.isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="create-event-credit-form"
          disabled={form.state.isSubmitting}
        >
          Add credit
        </Button>
      </div>
    </form>
  )
}
