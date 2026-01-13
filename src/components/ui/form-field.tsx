import type { AnyFieldApi } from '@tanstack/react-form'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'

export function FormField({
  field,
  label,
  description,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  field: AnyFieldApi
  label: string
  description?: string
  children: React.ReactNode
}) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid} {...props} className="grid gap-2">
      <FieldLabel
        className="text-xs text-muted-foreground font-normal uppercase "
        htmlFor={field.name}
      >
        {label}
      </FieldLabel>
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
