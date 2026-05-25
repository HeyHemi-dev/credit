import { randomUUID } from 'node:crypto'
import { afterEach, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { db } from '@/db/connection'
import { getSupplierClaimByUserId } from '@/db/queries/supplier-claims'
import {
  supplierClaimVerifications,
  supplierClaims,
  suppliers,
  userInNeonAuth,
} from '@/db/schema'
import { SUPPLIER_CLAIM_STATUS } from '@/lib/constants'
import {
  archiveActiveSupplierClaimServer,
  createOrUpdateSupplierClaimServer,
} from '@/lib/server/supplier-claims'
import { createOrRefreshSupplierClaimVerificationServer } from '@/lib/server/supplier-claim-verifications'
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
    const claim = await createOrUpdateSupplierClaimServer(
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
    await createOrUpdateSupplierClaimServer(supplier.id, user.id, user.email)
    const savedClaim = await getSupplierClaimByUserId(user.id)
    // Assert
    expect(savedClaim?.claim.status).toBe(SUPPLIER_CLAIM_STATUS.APPROVED)
    expect(savedClaim?.claim.supplierId).toBe(supplier.id)
  })

  it('requires canceling the current claim before starting a new claim on a different supplier', async () => {
    // Arrange
    const user = await createTestUser(createdUserIds)
    const firstSupplier = await createTestSupplier(createdSupplierIds)
    const secondSupplier = await createTestSupplier(createdSupplierIds)

    await createOrUpdateSupplierClaimServer(
      firstSupplier.id,
      user.id,
      user.email,
    )

    // Act / Assert
    await expect(
      createOrUpdateSupplierClaimServer(
        secondSupplier.id,
        user.id,
        user.email,
      ),
    ).rejects.toThrow('Cancel your current supplier claim before starting another one')
  })
})

describe.skipIf(!isIntegrationTestMode)('archiveActiveSupplierClaim', () => {
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

  it('archives the pending claim and keeps its verification history so the user returns to no active claim state', async () => {
    // Arrange
    const user = await createTestUser(createdUserIds)
    const supplier = await createTestSupplier(createdSupplierIds)

    await createOrUpdateSupplierClaimServer(supplier.id, user.id, user.email)
    await createOrRefreshSupplierClaimVerificationServer(
      user.id,
      `code-hash-${user.id}`,
      new Date(Date.now() + 10 * 60 * 1000),
    )

    const pendingClaim = await getSupplierClaimByUserId(user.id)
    if (!pendingClaim) throw new Error('Pending claim not found')

    // Act
    await archiveActiveSupplierClaimServer(user.id)
    const savedClaim = await getSupplierClaimByUserId(user.id)
    const [archivedClaim] = await db
      .select()
      .from(supplierClaims)
      .where(eq(supplierClaims.id, pendingClaim.claim.id))
      .limit(1)
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
    expect(archivedClaim?.status).toBe(SUPPLIER_CLAIM_STATUS.ARCHIVED)
    expect(verification?.supplierClaimId).toBe(pendingClaim.claim.id)
  })

  it('archives an approved claim so the supplier profile is disconnected from the account', async () => {
    // Arrange
    const user = await createTestUser(createdUserIds)
    const supplier = await createTestSupplier(createdSupplierIds, {
      email: user.email,
    })

    await createOrUpdateSupplierClaimServer(supplier.id, user.id, user.email)

    const approvedClaim = await getSupplierClaimByUserId(user.id)
    if (!approvedClaim) throw new Error('Approved claim not found')

    // Act
    await archiveActiveSupplierClaimServer(user.id)
    const savedClaim = await getSupplierClaimByUserId(user.id)
    const [archivedClaim] = await db
      .select()
      .from(supplierClaims)
      .where(eq(supplierClaims.id, approvedClaim.claim.id))
      .limit(1)

    // Assert
    expect(savedClaim).toBeNull()
    expect(archivedClaim?.status).toBe(SUPPLIER_CLAIM_STATUS.ARCHIVED)
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
