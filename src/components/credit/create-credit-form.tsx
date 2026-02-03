import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import type { CreateCreditForm } from '@/lib/types/validation-schema'

import type { Service } from '@/lib/constants'
import { FieldGroup } from '@/components/ui/field'
import {
  createCreditFormSchema,
  serviceSchema,
} from '@/lib/types/validation-schema'
import { SERVICE, SERVICE_KEYS } from '@/lib/constants'
import { FormField } from '@/components/ui/form-field'
import { useCredits } from '@/hooks/use-credits'
import { Button } from '@/components/ui/button'
import { SupplierSearchCombobox } from '@/components/credit/supplier-search-combobox'
import { Textarea } from '@/components/ui/textarea'
import { useCreditContext } from '@/contexts/credit-page-context'
import { isShareAuth } from '@/hooks/use-auth'
import { RadioGroup } from '@/components/ui/radio-group'
import { PillRadioItem } from '@/components/ui/pill-radio-item'

const defaultValues: CreateCreditForm = {
  service: '' as Service,
  // cast type since we want this field to be empty initially,
  // but required on submission
  supplierId: '',
  contributionNotes: '',
}

export function CreateCreditForm({
  onSubmit,
  onCancel,
  containerRef,
}: {
  onSubmit: () => void
  onCancel: () => void
  containerRef?: React.RefObject<HTMLDivElement | null>
}) {
  const { eventId, authToken } = useCreditContext()
  const { createCreditMutation } = useCredits(eventId, authToken)

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
          name="supplierId"
          children={(field) => (
            <FormField field={field} label="Who it was" isRequired={true}>
              <SupplierSearchCombobox
                shareToken={
                  isShareAuth(authToken) ? authToken.token : undefined
                }
                eventId={eventId}
                handleChange={(supplierId) => field.handleChange(supplierId)}
                containerRef={containerRef}
              />
            </FormField>
          )}
        />

        <form.Field
          name="service"
          children={(field) => (
            <FormField field={field} label="What they did" isRequired={true}>
              <RadioGroup
                value={field.state.value}
                onValueChange={(value) => {
                  const { data: service } = serviceSchema.safeParse(value)
                  if (!service) return
                  field.handleChange(service)
                }}
                className="flex flex-wrap gap-2"
              >
                {SERVICE_KEYS.map((key) => {
                  const service = SERVICE[key]
                  const isSelected = field.state.value === service

                  return (
                    <PillRadioItem
                      key={key}
                      id={key}
                      value={service}
                      label={service}
                      isSelected={isSelected}
                      onClick={() => field.handleChange(service)}
                    />
                  )
                })}
              </RadioGroup>
            </FormField>
          )}
        />

        <form.Field
          name="contributionNotes"
          children={(field) => (
            <FormField field={field} label="Notes" isRequired={false}>
              <Textarea
                id={field.name}
                value={field.state.value}
                placeholder="Optional —anything worth mentioning?"
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
          Save
        </Button>
      </div>
    </form>
  )
}
