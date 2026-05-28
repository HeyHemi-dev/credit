import { describe, expect, it } from 'vitest'
import {
  createSupplierFormSchema,
  createSupplierSchema,
  editSupplierProfileFormSchema,
  updateSupplierProfileSchema,
} from '@/lib/types/validation-schema'

describe('createSupplierFormSchema', () => {
  it('normalizes email and handle casing while still allowing empty optional fields', () => {
    // Arrange
    const input = {
      name: '  Foo Bar Studio  ',
      email: 'Foo.Bar@Example.COM',
      region: '',
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
      instagramHandle: '@foo.bar',
      tiktokHandle: '',
    })
  })
})

describe('createSupplierSchema', () => {
  it('strips handle prefixes and preserves null optional fields for the API payload', () => {
    // Arrange
    const input = {
      name: '  Foo Bar Studio  ',
      email: 'Foo.Bar@Example.COM',
      region: null,
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
      instagramHandle: 'foo.bar',
      tiktokHandle: null,
    })
  })
})

describe('editSupplierProfileFormSchema', () => {
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
    const result = editSupplierProfileFormSchema.safeParse(input)

    // Assert
    expect(result.success).toBe(false)
  })
})

describe('updateSupplierProfileSchema', () => {
  it('strips handles and keeps profile fields ready for saving', () => {
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
    const result = updateSupplierProfileSchema.parse(input)

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
