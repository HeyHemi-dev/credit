'use client'

import * as React from 'react'
import { useForm } from '@tanstack/react-form'

import { CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { AuthUserId, CreateEventForm } from '@/lib/types/validation-schema'
import { Button } from '@/components/ui/button'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import {
  createEventFormSchema,
  regionSchema,
} from '@/lib/types/validation-schema'

import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
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
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Event Name</FieldLabel>
                <Input
                  id={field.name}
                  type="text"
                  aria-invalid={isInvalid}
                  placeholder="e.g. Pam & Jim's Wedding"
                  autoComplete="off"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Field
          name="weddingDate"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Wedding Date</FieldLabel>
                <DateInputWebStandard
                  id={field.name}
                  name={field.name}
                  aria-invalid={isInvalid}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Field
          name="region"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Region</FieldLabel>
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
                    {REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
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

function DateInputWebStandard({
  className,
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <Input
      type="date"
      {...props}
      className={cn('bg-background pr-10', className)}
    />
  )
}

function formatDate(date: Date | undefined) {
  if (!date) {
    return ''
  }

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

export function DateInput({
  className,
  type,
  ...props
}: React.ComponentProps<'input'>) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [month, setMonth] = React.useState<Date | undefined>(date)
  const [value, setValue] = React.useState(formatDate(date))

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1">
        Subscription Date
      </Label>
      <div className="relative flex gap-2">
        <Input
          {...props}
          id="date"
          value={value}
          placeholder="June 01, 2025"
          className={cn('bg-background pr-10', className)}
          onChange={(e) => {
            const dateValue = new Date(e.target.value)
            setValue(e.target.value)
            if (isValidDate(dateValue)) {
              setDate(dateValue)
              setMonth(dateValue)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen} modal={true}>
          <PopoverTrigger>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={(dateValue) => {
                setDate(dateValue)
                setValue(formatDate(dateValue))
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
