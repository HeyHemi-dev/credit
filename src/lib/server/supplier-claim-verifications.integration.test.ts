import { createHash, randomUUID } from 'node:crypto'
import { afterEach, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { db } from '@/db/connection'
import { getSupplierClaimByUserId } from '@/db/queries/supplier-claims'
import { supplierClaimVerifications, suppliers, userInNeonAuth } from '@/db/schema'
import { createOrUpdateSupplierClaim } from '@/lib/server/supplier-claims'
import { createOrRefreshSupplierClaimVerification } from '@/lib/server/supplier-claim-verifications'
import { isIntegrationTestMode } from '@/testing/integration'

describe.skipIf(!isIntegrationTestMode)(
  'createOrRefreshSupplierClaimVerification',
  () => {
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

    it('invalidates the previous verification code when a pending claim switches suppliers', async () => {
      // Arrange
      const user = await createTestUser(createdUserIds)
      const firstSupplier = await createTestSupplier(createdSupplierIds)
      const secondSupplier = await createTestSupplier(createdSupplierIds)

      await createOrUpdateSupplierClaim(firstSupplier.id, user.id, user.email)
      await createOrRefreshSupplierClaimVerification(
        user.id,
        hashVerificationCode(user.id, 'abc123'),
        new Date(Date.now() + 10 * 60 * 1000),
      )

      // Act
      await createOrUpdateSupplierClaim(secondSupplier.id, user.id, user.email)
      const updatedClaim = await getSupplierClaimByUserId(user.id)
      if (!updatedClaim) throw new Error('Updated claim not found')
      const [verification] = await db
        .select()
        .from(supplierClaimVerifications)
        .where(
          eq(supplierClaimVerifications.supplierClaimId, updatedClaim.claim.id),
        )
        .limit(1)

      // Assert
      expect(updatedClaim.claim.supplierId).toBe(secondSupplier.id)
      expect(updatedClaim.claim.status).toBe('pending')
      expect(verification).toBeUndefined()
    })
  },
)

function hashVerificationCode(userId: string, code: string) {
  return createHash('sha256').update(`${userId}:${code}`).digest('hex')
}

async function createTestUser(
  createdUserIds: Array<string>,
  overrides: Partial<typeof userInNeonAuth.$inferInsert> = {},
) {
  const userId = randomUUID()
  createdUserIds.push(userId)

  const [user] = await db
    .insert(userInNeonAuth)
    .values({
      id: userId,
      email: `claim-test-${userId}@example.com`,
      emailVerified: true,
      name: `Claim Test ${userId.slice(0, 8)}`,
      ...overrides,
    })
    .returning()

  return user
}

async function createTestSupplier(
  createdSupplierIds: Array<string>,
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
