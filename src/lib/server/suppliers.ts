import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  createSupplierInputSchema,
  supplierSearchInputSchema,
} from '@/lib/validations'
import {
  createSupplier,
  getSupplierByEmail,
  searchSuppliers,
} from '@/db/queries/suppliers'
import { requireUserId } from '@/lib/server/auth'
import { ERROR } from '@/lib/errors'
import type { SupplierSearchResult } from '@/lib/types/front-end'

function mapSupplierToSearchResult(
  supplier: Awaited<ReturnType<typeof getSupplierByEmail>>,
): SupplierSearchResult {
  if (!supplier) {
    return {
      id: '',
      name: '',
      email: '',
      region: '',
      instagramHandle: '',
      tiktokHandle: '',
    }
  }
  return {
    id: supplier.id,
    name: supplier.name,
    email: supplier.email,
    region: supplier.region ?? '',
    instagramHandle: supplier.instagramHandle ?? '',
    tiktokHandle: supplier.tiktokHandle ?? '',
  }
}

function mapSuppliersToSearchResults(
  suppliers: Array<Awaited<ReturnType<typeof getSupplierByEmail>>>,
): Array<SupplierSearchResult> {
  return suppliers.map((supplier) => mapSupplierToSearchResult(supplier))
}

/**
 * Photographer-side supplier search (protected)
 */
export const searchSuppliersFn = createServerFn({ method: 'GET' })
  .inputValidator(supplierSearchInputSchema)
  .handler(async ({ request, data }): Promise<Array<SupplierSearchResult>> => {
    await requireUserId(request)
    const suppliers = await searchSuppliers(data.query)
    return mapSuppliersToSearchResults(suppliers)
  })

/**
 * Couple-side supplier search (public, via event ID)
 * V1: event lookup happens at route level.
 */
export const searchSuppliersForCoupleFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      eventId: z.string().uuid().optional(),
      query: z.string().trim().min(1),
    }),
  )
  .handler(async ({ data }): Promise<Array<SupplierSearchResult>> => {
    // eventId validity is checked at route level; keep this function generic.
    const suppliers = await searchSuppliers(data.query)
    return mapSuppliersToSearchResults(suppliers)
  })

/**
 * Couple-side supplier create (public, via event ID)
 * If email already exists, returns existing supplier instead of failing.
 */
export const createSupplierForCoupleFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      eventId: z.string().uuid().optional(),
      supplier: createSupplierInputSchema,
    }),
  )
  .handler(async ({ data }): Promise<SupplierSearchResult> => {
    const existing = await getSupplierByEmail(data.supplier.email)
    if (existing) return mapSupplierToSearchResult(existing)

    const supplier = await createSupplier({
      id: crypto.randomUUID(),
      name: data.supplier.name,
      email: data.supplier.email,
      instagramHandle: data.supplier.instagramHandle,
      tiktokHandle: data.supplier.tiktokHandle,
      region: data.supplier.region,
    })

    return mapSupplierToSearchResult(supplier)
  })
