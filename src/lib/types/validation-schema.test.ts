import { describe, expect, it } from 'vitest'
import {
  createSupplierFormSchema,
  createSupplierSchema,
} from '@/lib/types/validation-schema'

describe('createSupplierFormSchema', () => {
  it('normalizes email and handle casing while still allowing empty optional fields', () => {
    // Arrange
    const input = {
      name: '  Foo Bar Studio  ',
      email: 'Foo.Bar@Example.COM',
      region: '',
      regionsServed: [],
      services: [],
      website: '',
      instagramHandle: '@Foo.Bar',
      tiktokHandle: '',
    }

    // Act
    const result = createSupplierFormSchema.parse(input)

    // Assert
    expect(result).toEqual({
      name: 'Foo Bar Studio',
      email: 'foo.bar@example.com',
      region: '',
      regionsServed: [],
      services: [],
      website: '',
      instagramHandle: '@foo.bar',
      tiktokHandle: '',
    })
  })

  it('rejects duplicate regions served and services', () => {
    // Arrange
    const input = {
      name: '  Foo Bar Studio  ',
      email: 'Foo.Bar@Example.COM',
      region: '',
      regionsServed: ['Auckland', 'Auckland'],
      services: ['Photographer', 'Photographer'],
      website: '',
      instagramHandle: '@Foo.Bar',
      tiktokHandle: '',
    }

    // Act
    const result = createSupplierFormSchema.safeParse(input)

    // Assert
    expect(result.success).toBe(false)
  })
})

describe('createSupplierSchema', () => {
  it('strips handle prefixes and preserves null optional fields for the API payload', () => {
    // Arrange
    const input = {
      name: '  Foo Bar Studio  ',
      email: 'Foo.Bar@Example.COM',
      region: null,
      regionsServed: ['Auckland'],
      services: ['Photographer'],
      website: 'https://example.com',
      instagramHandle: '@Foo.Bar',
      tiktokHandle: null,
    }

    // Act
    const result = createSupplierSchema.parse(input)

    // Assert
    expect(result).toEqual({
      name: 'Foo Bar Studio',
      email: 'foo.bar@example.com',
      region: null,
      regionsServed: ['Auckland'],
      services: ['Photographer'],
      website: 'https://example.com',
      instagramHandle: 'foo.bar',
      tiktokHandle: null,
    })
  })
})
