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
import { useEvents } from '@/hooks/use-events'
import { REGIONS } from '@/lib/constants'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { emptyStringToNull } from '@/lib/empty-strings'
import { FormField } from '@/components/ui/form-field'
import { DatePicker } from '@/components/ui/date-picker'
import { formatDateToDrizzleDateString } from '@/lib/format-dates'

const defaultValues: CreateEventForm = {
  eventName: '',
  weddingDate: '',
  region: '',
}

export function CreateEventForm({
  authUserId,
  containerRef,
}: {
  authUserId: string
  containerRef?: React.RefObject<HTMLDivElement | null>
}) {
  const { eventsMutation } = useEvents(authUserId)

  const form = useForm({
    defaultValues: defaultValues,
    validators: {
      onSubmit: createEventFormSchema,
    },
    onSubmit: async ({ value }) => {
      await eventsMutation.mutateAsync({
        eventName: value.eventName,
        weddingDate: value.weddingDate,
        region: emptyStringToNull(value.region),
        authUserId: authUserId,
      })
    },
  })

  return (
    <form
      id="create-event-form"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup>
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
              <Select
                value={field.state.value}
                onValueChange={(v) => {
                  const { data: region } = regionSchema.safeParse(v)
                  field.handleChange(region ?? '')
                }}
              >
                <SelectTrigger>
                  <SelectValue>
                    {field.state.value ? field.state.value : 'Select region'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent container={containerRef}>
                  <SelectItem key="none" value="">
                    None
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
        <Button
          type="submit"
          form="create-event-form"
          disabled={form.state.isSubmitting}
        >
          Create Event
        </Button>
      </FieldGroup>
    </form>
  )
}
