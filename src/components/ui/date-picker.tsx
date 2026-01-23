import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { UnfoldMoreIcon } from '@hugeicons/core-free-icons'

import { Calendar } from '@/components/ui/calendar'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { InputDiv } from '@/components/ui/input'
import { formatDate, parseDrizzleDateStringToDate } from '@/lib/format-dates'

type DatePickerProps = {
  id: string
  placeholder: string
  value: string | undefined
  onValueChange: (date: Date | undefined) => void
  className?: string
  containerRef?: React.RefObject<HTMLDivElement | null>
} & React.ComponentProps<'div'>

export function DatePicker({
  id,
  placeholder,
  value,
  onValueChange,
  className,
  containerRef,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const parsedDate = value ? parseDrizzleDateStringToDate(value) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <InputDiv
          id={id}
          className={cn(
            'flex items-center justify-between',
            !parsedDate && 'text-muted-foreground',
            className,
          )}
          {...props}
        >
          {formatDate(parsedDate) ?? placeholder}
          <HugeiconsIcon
            icon={UnfoldMoreIcon}
            strokeWidth={2}
            className="text-muted-foreground size-4 pointer-events-none"
          />
        </InputDiv>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden p-0"
        align="start"
        container={containerRef}
      >
        <Calendar
          mode="single"
          selected={parsedDate}
          captionLayout="dropdown"
          onSelect={(date) => {
            onValueChange(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
