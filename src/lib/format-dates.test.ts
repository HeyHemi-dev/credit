import { afterEach, describe, expect, it } from 'vitest'
import {
  formatDateToDrizzleDateString,
  parseDrizzleDateStringToDate,
} from '@/lib/format-dates'
import { weddingDateSchema } from '@/lib/types/validation-schema'

const originalTimeZone = process.env.TZ

afterEach(() => {
  // Reset the process timezone so tests do not leak date behavior into each other.
  if (originalTimeZone === undefined) {
    delete process.env.TZ
    return
  }

  process.env.TZ = originalTimeZone
})

describe('parseDrizzleDateStringToDate', () => {
  it('round-trips a drizzle date string in a non-UTC timezone without shifting the day', () => {
    // Arrange
    process.env.TZ = 'America/Los_Angeles'

    // Act
    const parsedDate = parseDrizzleDateStringToDate('2025-02-03')

    // Assert
    expect(parsedDate).toBeDefined()
    expect(parsedDate?.getFullYear()).toBe(2025)
    expect(parsedDate?.getMonth()).toBe(1)
    expect(parsedDate?.getDate()).toBe(3)
    expect(parsedDate?.getHours()).toBe(0)
    expect(formatDateToDrizzleDateString(parsedDate!)).toBe('2025-02-03')
  })

  it('returns undefined for an invalid drizzle date string', () => {
    // Arrange
    const invalidDate = '2025/02/03'

    // Act
    const parsedDate = parseDrizzleDateStringToDate(invalidDate)

    // Assert
    expect(parsedDate).toBeUndefined()
  })

  it('returns undefined for a date-shaped string that is not a real calendar date', () => {
    // Arrange
    const invalidDate = '2025-02-31'

    // Act
    const parsedDate = parseDrizzleDateStringToDate(invalidDate)

    // Assert
    expect(parsedDate).toBeUndefined()
  })
})

describe('weddingDateSchema', () => {
  it('rejects impossible calendar dates', () => {
    // Arrange
    const invalidDate = '2025-02-31'

    // Act
    const result = weddingDateSchema.safeParse(invalidDate)

    // Assert
    expect(result.success).toBe(false)
  })
})
