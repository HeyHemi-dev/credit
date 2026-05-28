import { Checkbox } from '@/components/ui/checkbox'
import { FieldLabel, FieldTitle } from '@/components/ui/field'
import { RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

type PillRadioItemProps = {
  id: string
  value: string
  label: string
  isSelected: boolean
  onClick: () => void
}

type PillPickerItemProps = {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function PillRadioItem({
  id,
  value,
  label,
  isSelected,
  onClick,
}: PillRadioItemProps) {
  return (
    <FieldLabel
      htmlFor={id}
      className={cn(
        'relative flex cursor-pointer gap-0 rounded-full border border-input bg-input/30 p-0 outline-none hover:bg-secondary has-data-checked:bg-secondary has-[:focus-visible]:border-ring has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50',
        isSelected && 'bg-secondary hover:bg-secondary',
      )}
      onClick={(event) => {
        if (!isSelected) return
        event.preventDefault()
        onClick()
      }}
    >
      <FieldTitle
        className={cn(
          'px-3 py-1 text-sm font-normal text-muted-foreground',
          isSelected && 'text-primary',
        )}
      >
        {label}
      </FieldTitle>
      <RadioGroupItem
        id={id}
        value={value}
        aria-label={label}
        className="pointer-events-none absolute top-0 left-0 size-0 overflow-hidden border-0 opacity-0"
      />
    </FieldLabel>
  )
}

// Keep this visually aligned with PillRadioItem so single- and multi-select pills stay in sync.
export function PillPickerItem({
  id,
  label,
  checked,
  onCheckedChange,
}: PillPickerItemProps) {
  return (
    <FieldLabel
      htmlFor={id}
      className={cn(
        'relative flex cursor-pointer gap-0 rounded-full border border-input bg-input/30 p-0 outline-none hover:bg-secondary has-data-checked:bg-secondary has-[:focus-visible]:border-ring has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50',
        checked && 'border-primary/50 bg-secondary hover:bg-secondary',
      )}
    >
      <FieldTitle
        className={cn(
          'px-3 py-1 text-sm font-normal text-muted-foreground',
          checked && 'text-primary',
        )}
      >
        {label}
      </FieldTitle>
      <Checkbox
        id={id}
        checked={checked}
        aria-label={label}
        onCheckedChange={onCheckedChange}
        className="pointer-events-none absolute top-0 left-0 size-0 overflow-hidden border-0 opacity-0"
      />
    </FieldLabel>
  )
}
