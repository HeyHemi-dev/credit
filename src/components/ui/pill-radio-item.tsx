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
        'flex cursor-pointer gap-0 rounded-full border border-input bg-input/30 p-0',
        isSelected &&
          'has-data-checked:border-primary has-data-checked:bg-background',
      )}
      onClick={(event) => {
        if (!isSelected) return
        event.preventDefault()
        onClick()
      }}
    >
      <FieldTitle
        className={cn(
          'py-0.5 pl-2.5 text-sm font-normal text-muted-foreground',
          isSelected && 'text-primary',
        )}
      >
        {label}
      </FieldTitle>
      <div className="flex items-center justify-center p-1.5">
        <RadioGroupItem id={id} value={value} aria-label={label} />
      </div>
    </FieldLabel>
  )
}
