const yyyyMmDdDatePattern = /^\d{4}-\d{2}-\d{2}$/

export function isIsoCalendarDateString(value: string): boolean {
  const trimmedValue = value.trim()
  if (!yyyyMmDdDatePattern.test(trimmedValue)) return false

  const [year, month, day] = trimmedValue.split('-').map(Number)
  if (year === undefined || month === undefined || day === undefined) return false

  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}
