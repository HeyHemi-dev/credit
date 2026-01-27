import { createServerFn } from '@tanstack/react-start'
import type { Supplier } from '@/lib/types/front-end'
import type { SupplierRow } from '@/db/queries/suppliers'
import {
  authTokenSchema,
  createSupplierSchema,
  dedupeSuppliersSchema,
  searchSuppliersSchema,
} from '@/lib/types/validation-schema'
import {
  createSupplier,
  findSupplierDedupeCandidates,
  searchSuppliers,
} from '@/db/queries/suppliers'
import { isValidAuthToken } from '@/lib/server/auth'
import { ERROR } from '@/lib/errors'
import { tryCatch } from '@/lib/try-catch'
import { logger } from '@/lib/logger'

export const searchSuppliersFn = createServerFn({ method: 'GET' })
  .inputValidator(searchSuppliersSchema)
  .handler(async ({ data }): Promise<Array<Supplier>> => {
    const suppliers = await searchSuppliers(data.query)
    return mapSuppliersToSearchResults(suppliers)
  })

/**
 * Search for potential duplicate suppliers
 */
export const dedupeSuppliersFn = createServerFn({ method: 'GET' })
  .inputValidator(dedupeSuppliersSchema)
  .handler(async ({ data }): Promise<Array<Supplier>> => {
    // eventId validity is checked at route level; keep this function generic.
    const { data: suppliers, error } = await tryCatch(
      findSupplierDedupeCandidates({
        email: data.email,
        name: data.name,
      }),
    )
    if (error)
      logger.error('dedupeSuppliersFn', {
        data,
        error,
      })
    if (!suppliers) return []
    return mapSuppliersToSearchResults(suppliers)
  })

/**
 * Couple-side supplier create (public, via event ID)
 * If email already exists, returns existing supplier instead of failing.
 */
export const createSupplierFn = createServerFn({ method: 'POST' })
  .inputValidator(
    createSupplierSchema.extend({
      authToken: authTokenSchema,
    }),
  )
  .handler(async ({ data }): Promise<Supplier> => {
    const isValid = await isValidAuthToken(data.authToken)
    if (!isValid) throw ERROR.FORBIDDEN()

    const supplier = await createSupplier({
      name: data.name,
      email: data.email,
      instagramHandle: data.instagramHandle,
      tiktokHandle: data.tiktokHandle,
      region: data.region,
    })

    return mapSupplierToSearchResult(supplier)
  })

function mapSupplierToSearchResult(supplier: SupplierRow): Supplier {
  return {
    id: supplier.id,
    name: supplier.name,
    email: supplier.email,
    region: supplier.region,
    instagramHandle: supplier.instagramHandle,
    tiktokHandle: supplier.tiktokHandle,
  }
}

function mapSuppliersToSearchResults(
  suppliers: Array<SupplierRow>,
): Array<Supplier> {
  return suppliers.map((supplier) => mapSupplierToSearchResult(supplier))
}
