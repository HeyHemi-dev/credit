import { weddingDateSchema } from '@/lib/types/validation-schema'

/**
 * Parses YYYY-MM-DD date string to Date object.
 */
export function parseDrizzleDateStringToDate(date: string) {
  const { data } = weddingDateSchema.safeParse(date)
  if (!data) return undefined

  // Parse as local date to avoid timezone issues
  const [year, month, day] = data.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Formats Date object to YYYY-MM-DD date string.
 */
export function formatDateToDrizzleDateString(date: Date) {
  const year = date.getFullYear().toString().padStart(4, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Formats Date object for display in the UI.
 */
export function formatDate(date: Date | undefined) {
  if (!date || isNaN(date.getTime())) return undefined

  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
