import { randomUUID } from 'node:crypto'
import { afterEach, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { db } from '@/db/connection'
import {
  getSupplierClaimByUserId,
  getSupplierOwnedByUserId,
} from '@/db/queries/supplier-claims'
import { supplierClaimVerifications, suppliers, userInNeonAuth } from '@/db/schema'
import {
  cancelPendingSupplierClaim,
  createOrUpdateSupplierClaim,
} from '@/lib/server/supplier-claims'
import { createOrRefreshSupplierClaimVerification } from '@/lib/server/supplier-claim-verifications'
import { isIntegrationTestMode } from '@/testing/integration'

describe.skipIf(!isIntegrationTestMode)('createOrUpdateSupplierClaim', () => {
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

  it('creates a pending claim when the login email does not match the supplier email', async () => {
    // Arrange
    const user = await createTestUser(createdUserIds)
    const supplier = await createTestSupplier(createdSupplierIds)

    // Act
    const claim = await createOrUpdateSupplierClaim(
      supplier.id,
      user.id,
      user.email,
    )

    // Assert
    expect(claim.supplier.id).toBe(supplier.id)
    expect(claim.status).toBe('pending')
  })

  it('auto-approves the claim when the login email matches the supplier email', async () => {
    // Arrange
    const user = await createTestUser(createdUserIds)
    const supplier = await createTestSupplier(createdSupplierIds, {
      email: user.email,
    })

    // Act
    await createOrUpdateSupplierClaim(supplier.id, user.id, user.email)
    const savedClaim = await getSupplierClaimByUserId(user.id)
    const ownedSupplier = await getSupplierOwnedByUserId(user.id)

    // Assert
    expect(savedClaim?.claim.status).toBe('approved')
    expect(ownedSupplier?.id).toBe(supplier.id)
  })
})

describe.skipIf(!isIntegrationTestMode)('cancelPendingSupplierClaim', () => {
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

  it('removes the pending claim and its verification so the user returns to no claim state', async () => {
    // Arrange
    const user = await createTestUser(createdUserIds)
    const supplier = await createTestSupplier(createdSupplierIds)

    await createOrUpdateSupplierClaim(supplier.id, user.id, user.email)
    await createOrRefreshSupplierClaimVerification(
      user.id,
      `code-hash-${user.id}`,
      new Date(Date.now() + 10 * 60 * 1000),
    )

    const pendingClaim = await getSupplierClaimByUserId(user.id)
    if (!pendingClaim) throw new Error('Pending claim not found')

    // Act
    await cancelPendingSupplierClaim(user.id)
    const savedClaim = await getSupplierClaimByUserId(user.id)
    const [verification] = await db
      .select()
      .from(supplierClaimVerifications)
      .where(
        eq(
          supplierClaimVerifications.supplierClaimId,
          pendingClaim.claim.id,
        ),
      )
      .limit(1)

    // Assert
    expect(savedClaim).toBeNull()
    expect(verification).toBeUndefined()
  })
})

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
