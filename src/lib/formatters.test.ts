import { describe, expect, it } from 'vitest'
import type { Credit } from '@/lib/types/front-end'
import { SERVICE } from '@/lib/constants'
import { formatInstagramCredits } from '@/lib/formatters'

function createCredit(overrides: Partial<Credit>): Credit {
  return {
    id: overrides.id ?? 'credit-id',
    name: overrides.name ?? 'Supplier',
    email: overrides.email ?? 'supplier@example.com',
    instagramHandle: overrides.instagramHandle ?? null,
    tiktokHandle: overrides.tiktokHandle ?? null,
    service: overrides.service ?? SERVICE.PHOTOGRAPHER,
    contributionNotes: overrides.contributionNotes ?? null,
  }
}

describe('formatInstagramCredits', () => {
  it('sorts by service order and falls back to supplier name when a handle is missing', () => {
    // Arrange
    const credits = [
      createCredit({
        id: 'band',
        name: 'Zephyr Band',
        service: SERVICE.BAND,
      }),
      createCredit({
        id: 'photographer-b',
        name: 'B Lens Studio',
        instagramHandle: 'blensstudio',
        service: SERVICE.PHOTOGRAPHER,
      }),
      createCredit({
        id: 'venue',
        name: 'Kauri Estate',
        service: SERVICE.VENUE,
      }),
      createCredit({
        id: 'photographer-a',
        name: 'A Lens Studio',
        service: SERVICE.PHOTOGRAPHER,
      }),
    ]

    // Act
    const result = formatInstagramCredits(credits)

    // Assert
    expect(result).toBe(
      [
        'Venue - Kauri Estate',
        'Photographer - A Lens Studio',
        'Photographer - @blensstudio',
        'Band - Zephyr Band',
      ].join('\n'),
    )
  })
})
