import { createServerFn } from '@tanstack/react-start'
import type { SupplierSearchResult } from '@/lib/types/front-end'
import type { SupplierRow } from '@/db/queries/suppliers'
import { supplierSearchInputSchema } from '@/lib/validations'
import {
  authTokenSchema,
  createSupplierSchema,
  dedupeSuppliersSchema,
} from '@/lib/types/validation-schema'
import {
  createSupplier,
  findSupplierDedupeCandidates,
  searchSuppliers,
} from '@/db/queries/suppliers'
import { nullToEmptyString } from '@/lib/empty-strings'
import { authClient, isValidAuthToken } from '@/lib/server/auth'

/**
 * Photographer-side supplier search (protected)
 */
export const searchSuppliersFn = createServerFn({ method: 'GET' })
  .inputValidator(supplierSearchInputSchema)
  .handler(async ({ data }): Promise<Array<SupplierSearchResult>> => {
    const suppliers = await searchSuppliers(data.query)
    return mapSuppliersToSearchResults(suppliers)
  })

/**
 * Search for potential duplicate suppliers
 */
export const dedupeSuppliersFn = createServerFn({ method: 'GET' })
  .inputValidator(dedupeSuppliersSchema)
  .handler(async ({ data }): Promise<Array<SupplierSearchResult>> => {
    // eventId validity is checked at route level; keep this function generic.
    const suppliers = await findSupplierDedupeCandidates({
      email: data.email,
      name: data.name,
    })
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
  .handler(async ({ data }): Promise<SupplierSearchResult> => {
    const session = await authClient.getSession()
    console.log({ session })
    const isValid = await isValidAuthToken(data.authToken)

    const supplier = await createSupplier({
      name: data.name,
      email: data.email,
      instagramHandle: data.instagramHandle,
      tiktokHandle: data.tiktokHandle,
      region: data.region,
    })

    return mapSupplierToSearchResult(supplier)
  })

function mapSupplierToSearchResult(
  supplier: SupplierRow,
): SupplierSearchResult {
  return {
    id: supplier.id,
    name: supplier.name,
    email: supplier.email,
    region: nullToEmptyString(supplier.region),
    instagramHandle: nullToEmptyString(supplier.instagramHandle),
    tiktokHandle: nullToEmptyString(supplier.tiktokHandle),
  }
}

function mapSuppliersToSearchResults(
  suppliers: Array<SupplierRow>,
): Array<SupplierSearchResult> {
  return suppliers.map((supplier) => mapSupplierToSearchResult(supplier))
}
