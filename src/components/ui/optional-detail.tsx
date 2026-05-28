type OptionalDetailValue = string | Array<string> | null | undefined

type OptionalDetailProps = {
  label?: string
  prefix?: string
  value: OptionalDetailValue
}

export function OptionalDetail({
  label,
  prefix,
  value,
}: OptionalDetailProps) {
  const content = toOptionalDetailContent(value)
  if (!content) return null

  return (
    <p className="text-muted-foreground">
      {label ? `${label}: ` : ''}
      {prefix ?? ''}
      {content}
    </p>
  )
}

function toOptionalDetailContent(value: OptionalDetailValue) {
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : null
  if (!value) return null
  return value
}
