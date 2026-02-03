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
        'flex cursor-pointer gap-2 rounded-full border py-1.5 pr-1.5 pl-3',
        isSelected && 'border-primary bg-primary/20',
      )}
      onClick={(event) => {
        if (!isSelected) return
        event.preventDefault()
        onClick()
      }}
    >
      <FieldTitle
        className={cn(
          'text-xs font-normal text-muted-foreground uppercase',
          isSelected && 'text-primary',
        )}
      >
        {label}
      </FieldTitle>

      <RadioGroupItem id={id} value={value} aria-label={label} />
    </FieldLabel>
  )
}
