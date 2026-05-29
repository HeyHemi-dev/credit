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

type PillShellProps = {
  children: React.ReactNode
  htmlFor: string
  isSelected: boolean
  label: string
  onClick?: React.MouseEventHandler<HTMLLabelElement>
}

type PillCheckboxItemProps = {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function PillShell({
  children,
  htmlFor,
  isSelected,
  label,
  onClick,
}: PillShellProps) {
  return (
    <FieldLabel
      htmlFor={htmlFor}
      className={cn(
        'relative flex cursor-pointer gap-0 rounded-full border border-input bg-input/30 p-0 outline-none hover:bg-secondary has-data-checked:bg-secondary has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50',
        isSelected && 'border-primary/50 bg-secondary hover:bg-secondary',
      )}
      onClick={onClick}
    >
      <FieldTitle
        className={cn(
          'px-3 py-1 text-sm font-normal text-muted-foreground',
          isSelected && 'text-primary',
        )}
      >
        {label}
      </FieldTitle>
      {children}
    </FieldLabel>
  )
}

export function PillRadioItem({
  id,
  value,
  label,
  isSelected,
  onClick,
}: PillRadioItemProps) {
  return (
    <PillShell
      htmlFor={id}
      isSelected={isSelected}
      label={label}
      onClick={(event) => {
        if (!isSelected) return
        event.preventDefault()
        onClick()
      }}
    >
      <RadioGroupItem
        id={id}
        value={value}
        aria-label={label}
        className="pointer-events-none absolute top-0 left-0 size-0 overflow-hidden border-0 opacity-0"
      />
    </PillShell>
  )
}

// Keep this visually aligned with PillRadioItem so single- and multi-select pills stay in sync.
export function PillCheckboxItem({
  id,
  label,
  checked,
  onCheckedChange,
}: PillCheckboxItemProps) {
  return (
    <PillShell htmlFor={id} isSelected={checked} label={label}>
      <Checkbox
        id={id}
        checked={checked}
        aria-label={label}
        onCheckedChange={onCheckedChange}
        className="pointer-events-none absolute top-0 left-0 size-0 overflow-hidden border-0 opacity-0"
      />
    </PillShell>
  )
}
