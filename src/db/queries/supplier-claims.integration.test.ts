import { randomUUID } from 'node:crypto'
import { afterEach, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { db } from '@/db/connection'
import {
  createOrUpdateSupplierClaim,
  getSupplierClaimByUserId,
} from '@/db/queries/supplier-claims'
import { suppliers, userInNeonAuth } from '@/db/schema'
import { isIntegrationTestMode } from '@/testing/integration'

describe('createOrUpdateSupplierClaim', () => {
  const createdSupplierIds: Array<string> = []
  const createdUserIds: Array<string> = []

  afterEach(async () => {
    // Arrange
    for (const supplierId of createdSupplierIds.splice(0).reverse()) {
      await db.delete(suppliers).where(eq(suppliers.id, supplierId))
    }

    for (const userId of createdUserIds.splice(0).reverse()) {
      await db.delete(userInNeonAuth).where(eq(userInNeonAuth.id, userId))
    }
  })

  it.skipIf(!isIntegrationTestMode)(
    'creates a first pending claim for a user',
    async () => {
      // Arrange
      const user = await createTestUser()
      const supplier = await createTestSupplier()

      // Act
      const claim = await createOrUpdateSupplierClaim(supplier.id, user.id)

      // Assert
      expect(claim.userId).toBe(user.id)
      expect(claim.supplierId).toBe(supplier.id)
      expect(claim.status).toBe('pending')
    },
  )

  it.skipIf(!isIntegrationTestMode)(
    'updates the same pending claim to a different supplier',
    async () => {
      // Arrange
      const user = await createTestUser()
      const firstSupplier = await createTestSupplier()
      const secondSupplier = await createTestSupplier()
      await createOrUpdateSupplierClaim(firstSupplier.id, user.id)

      // Act
      await createOrUpdateSupplierClaim(secondSupplier.id, user.id)
      const updatedClaim = await getSupplierClaimByUserId(user.id)

      // Assert
      expect(updatedClaim).not.toBeNull()
      expect(updatedClaim?.claim.supplierId).toBe(secondSupplier.id)
      expect(updatedClaim?.claim.status).toBe('pending')
    },
  )

  it.skipIf(!isIntegrationTestMode)(
    'rejects a claim when another user already has a pending claim for that supplier',
    async () => {
      // Arrange
      const firstUser = await createTestUser()
      const secondUser = await createTestUser()
      const supplier = await createTestSupplier()
      await createOrUpdateSupplierClaim(supplier.id, firstUser.id)

      // Act
      const attempt = createOrUpdateSupplierClaim(supplier.id, secondUser.id)

      // Assert
      await expect(attempt).rejects.toThrow(
        'This supplier already has a pending claim request',
      )
    },
  )

  it.skipIf(!isIntegrationTestMode)(
    'rejects a new claim when the user already owns another claimed supplier',
    async () => {
      // Arrange
      const user = await createTestUser()
      const ownedSupplier = await createTestSupplier({ claimedByUserId: user.id })
      const otherSupplier = await createTestSupplier()

      // Act
      const attempt = createOrUpdateSupplierClaim(otherSupplier.id, user.id)

      // Assert
      expect(ownedSupplier.claimedByUserId).toBe(user.id)
      await expect(attempt).rejects.toThrow(
        'You already have a claimed supplier profile',
      )
    },
  )

  async function createTestUser() {
    const userId = randomUUID()
    createdUserIds.push(userId)

    const [user] = await db
      .insert(userInNeonAuth)
      .values({
        id: userId,
        email: `claim-test-${userId}@example.com`,
        emailVerified: true,
        name: `Claim Test ${userId.slice(0, 8)}`,
      })
      .returning()

    return user
  }

  async function createTestSupplier(
    overrides: Partial<typeof suppliers.$inferInsert> = {},
  ) {
    const supplierId = randomUUID()
    createdSupplierIds.push(supplierId)

    const [supplier] = await db
      .insert(suppliers)
      .values({
        id: supplierId,
        email: `supplier-${supplierId}@example.com`,
        name: `Supplier ${supplierId.slice(0, 8)}`,
        ...overrides,
      })
      .returning()

    return supplier
  }
})
