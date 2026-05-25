import { createHash, randomUUID } from 'node:crypto'
import { afterEach, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { db } from '@/db/connection'
import { getSupplierClaimByUserId } from '@/db/queries/supplier-claims'
import { supplierClaimVerifications, suppliers, userInNeonAuth } from '@/db/schema'
import { createOrUpdateSupplierClaimServer } from '@/lib/server/supplier-claims'
import { createOrRefreshSupplierClaimVerificationServer } from '@/lib/server/supplier-claim-verifications'
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

    it('refreshes the existing verification row for the current pending claim instead of creating another one', async () => {
      // Arrange
      const user = await createTestUser(createdUserIds)
      const supplier = await createTestSupplier(createdSupplierIds)
      await createOrUpdateSupplierClaimServer(supplier.id, user.id, user.email)

      const firstVerification =
        await createOrRefreshSupplierClaimVerificationServer(
          user.id,
          hashVerificationCode(user.id, 'abc123'),
          new Date(Date.now() + 10 * 60 * 1000),
        )
      await db
        .update(supplierClaimVerifications)
        .set({
          lastSentAt: new Date(Date.now() - 60 * 1000),
        })
        .where(eq(supplierClaimVerifications.id, firstVerification.id))

      // Act
      const refreshedVerification =
        await createOrRefreshSupplierClaimVerificationServer(
          user.id,
          hashVerificationCode(user.id, 'def456'),
          new Date(Date.now() + 20 * 60 * 1000),
        )
      const activeClaim = await getSupplierClaimByUserId(user.id)
      if (!activeClaim) throw new Error('Active claim not found')
      const verificationRows = await db
        .select()
        .from(supplierClaimVerifications)
        .where(
          eq(
            supplierClaimVerifications.supplierClaimId,
            activeClaim.claim.id,
          ),
        )

      // Assert
      expect(refreshedVerification.id).toBe(firstVerification.id)
      expect(verificationRows).toHaveLength(1)
      expect(verificationRows[0]?.codeHash).toBe(
        hashVerificationCode(user.id, 'def456'),
      )
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
