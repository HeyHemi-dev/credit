import { createHash, randomUUID } from 'node:crypto'
import { afterEach, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { db } from '@/db/connection'
import {
  approveSupplierClaim,
  claimSupplierForUser,
  getSupplierClaimByUserId,
  getSupplierOwnedByUserId,
} from '@/db/queries/supplier-claims'
import {
  consumeSupplierClaimVerification,
  createOrRefreshSupplierClaimVerification,
  verifySupplierClaimCode,
} from '@/db/queries/supplier-claim-verifications'
import {
  supplierClaimVerifications,
  suppliers,
  userInNeonAuth,
} from '@/db/schema'
import { createOrUpdateSupplierClaim } from '@/lib/server/supplier-claims'
import { isIntegrationTestMode } from '@/testing/integration'

describe.skipIf(!isIntegrationTestMode)('verifySupplierClaimCode', () => {
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

  it('approves a pending claim when the emailed verification code matches the current user claim', async () => {
    // Arrange
    const user = await createTestUser(createdUserIds)
    const supplier = await createTestSupplier(createdSupplierIds)
    await createOrUpdateSupplierClaim(supplier.id, user.id, user.email)

    const code = 'abc123'
    await createOrRefreshSupplierClaimVerification(
      user.id,
      hashVerificationCode(user.id, code),
      new Date(Date.now() + 10 * 60 * 1000),
    )

    // Act
    const claim = await verifySupplierClaimCode(
      user.id,
      hashVerificationCode(user.id, code),
    )
    await claimSupplierForUser(claim.supplier.id, user.id)
    await approveSupplierClaim(claim.claim.id)
    if (claim.verification) {
      await consumeSupplierClaimVerification(claim.verification.id)
    }
    const savedClaim = await getSupplierClaimByUserId(user.id)
    const ownedSupplier = await getSupplierOwnedByUserId(user.id)

    // Assert
    expect(savedClaim?.claim.status).toBe('approved')
    expect(ownedSupplier?.id).toBe(supplier.id)
  })
})

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
