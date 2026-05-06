import { afterEach, describe, expect, it, vi } from 'vitest'
import { uuidToGradient } from '@/lib/id-to-gradient'

describe('uuidToGradient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns a deterministic gradient when crypto.subtle is unavailable', async () => {
    // Arrange
    vi.stubGlobal('crypto', {})

    // Act
    const first = await uuidToGradient('event-id')
    const second = await uuidToGradient('event-id')

    // Assert
    expect(first).toEqual(second)
    expect(first.color1).toMatch(/^oklch\(/)
    expect(first.color2).toMatch(/^oklch\(/)
  })
})
