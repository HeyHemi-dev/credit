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
  isRequired,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  field: AnyFieldApi
  label: string
  isRequired?: boolean
  description?: string
  children: React.ReactNode
}) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid} {...props} className="grid gap-2">
      <FieldLabel
        className="text-xs text-muted-foreground font-normal uppercase flex items-baseline gap-2"
        htmlFor={field.name}
        aria-required={isRequired}
      >
        <span className="grow">{label}</span>
        {isRequired && (
          <span className="capitalize font-light text-muted-foreground/60">
            Required
          </span>
        )}
      </FieldLabel>
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && (
        <FieldError
          errors={field.state.meta.errors}
          className="wrap-anywhere"
        />
      )}
    </Field>
  )
}
