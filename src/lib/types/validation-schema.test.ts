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
      instagramHandle: '@Foo.Bar',
      tiktokHandle: '',
      region: '',
    }

    // Act
    const result = createSupplierFormSchema.parse(input)

    // Assert
    expect(result).toEqual({
      name: 'Foo Bar Studio',
      email: 'foo.bar@example.com',
      instagramHandle: '@foo.bar',
      tiktokHandle: '',
      region: '',
    })
  })
})

describe('createSupplierSchema', () => {
  it('strips handle prefixes and preserves null optional fields for the API payload', () => {
    // Arrange
    const input = {
      name: '  Foo Bar Studio  ',
      email: 'Foo.Bar@Example.COM',
      instagramHandle: '@Foo.Bar',
      tiktokHandle: null,
      region: null,
    }

    // Act
    const result = createSupplierSchema.parse(input)

    // Assert
    expect(result).toEqual({
      name: 'Foo Bar Studio',
      email: 'foo.bar@example.com',
      instagramHandle: 'foo.bar',
      tiktokHandle: null,
      region: null,
    })
  })
})
