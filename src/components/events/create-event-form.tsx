import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import type { CreateEventForm } from '@/lib/types/validation-schema'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  createEventFormSchema,
  regionSchema,
} from '@/lib/types/validation-schema'
import { useCreateEvent } from '@/hooks/use-events'
import { REGION, REGION_KEYS } from '@/lib/constants'
import { emptyStringToNull } from '@/lib/empty-strings'
import { FormField } from '@/components/ui/form-field'
import { DatePicker } from '@/components/ui/date-picker'
import { formatDateToDrizzleDateString } from '@/lib/format-dates'
import { isSessionAuth, useAuth } from '@/hooks/use-auth'
import { RadioGroup } from '@/components/ui/radio-group'
import { PillRadioItem } from '@/components/ui/pill-radio-item'

const defaultValues: CreateEventForm = {
  eventName: '',
  weddingDate: '',
  region: '',
}

export function CreateEventForm({
  onSubmit,
  onCancel,
  containerRef,
}: {
  onSubmit: () => void
  onCancel: () => void
  containerRef?: React.RefObject<HTMLDivElement | null>
}) {
  const authToken = useAuth()
  const createEvent = useCreateEvent(authToken)
  const isSession = isSessionAuth(authToken)

  const form = useForm({
    defaultValues: defaultValues,
    validators: {
      onSubmit: createEventFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (!isSession) return
      await createEvent.mutateAsync({
        eventName: value.eventName,
        weddingDate: value.weddingDate,
        region: emptyStringToNull(value.region),
      })
      onSubmit()
    },
  })

  return (
    <form
      id="create-event-form"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="grid gap-9"
    >
      <FieldGroup className="grid gap-6">
        <form.Field
          name="eventName"
          children={(field) => (
            <FormField field={field} label="Event Name">
              <Input
                id={field.name}
                type="text"
                placeholder="e.g. Nick and Charlie wedding"
                autoComplete="off"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </FormField>
          )}
        />
        <form.Field
          name="weddingDate"
          children={(field) => (
            <FormField field={field} label="Wedding Date">
              <DatePicker
                id={field.name}
                placeholder="Select date"
                value={field.state.value}
                onValueChange={(date) => {
                  field.handleChange(
                    date ? formatDateToDrizzleDateString(date) : '',
                  )
                }}
                containerRef={containerRef}
              />
            </FormField>
          )}
        />
        <form.Field
          name="region"
          children={(field) => (
            <FormField field={field} label="Region">
              <RadioGroup
                value={field.state.value}
                onValueChange={(value) => {
                  const { data: region } = regionSchema.safeParse(value)
                  field.handleChange(region ?? '')
                }}
                className="flex flex-wrap gap-2"
              >
                {REGION_KEYS.map((key) => {
                  const region = REGION[key]
                  const isSelected = field.state.value === region

                  return (
                    <PillRadioItem
                      key={key}
                      id={key}
                      value={region}
                      label={region}
                      isSelected={isSelected}
                      onClick={() => field.handleChange('')}
                    />
                  )
                })}
              </RadioGroup>
            </FormField>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          type="button"
          onClick={() => onCancel()}
          disabled={form.state.isSubmitting || !isSession}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="create-event-form"
          disabled={form.state.isSubmitting}
        >
          Create Event
        </Button>
      </div>
    </form>
  )
}
