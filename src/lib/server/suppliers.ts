import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createSupplierInputSchema, supplierSearchInputSchema } from '@/lib/validations'
import { searchSuppliers, createSupplier, getSupplierByEmail } from '@/db/queries/suppliers'
import { requireUserId } from '@/lib/server/auth'
import { ERROR } from '@/lib/errors'

/**
 * Photographer-side supplier search (protected)
 */
export const searchSuppliersFn = createServerFn({ method: 'GET' })
  .inputValidator(supplierSearchInputSchema)
  .handler(async ({ request, data }) => {
    await requireUserId(request)
    return await searchSuppliers(data.query)
  })

/**
 * Couple-side supplier search (public, via share token)
 * V1: token is the only access control.
 */
export const searchSuppliersForCoupleFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      shareToken: z.string().trim().min(32),
      query: z.string().trim().min(1),
    }),
  )
  .handler(async ({ data }) => {
    // shareToken validity is checked at route level; keep this function generic.
    return await searchSuppliers(data.query)
  })

/**
 * Couple-side supplier create (public, via share token)
 * If email already exists, returns existing supplier instead of failing.
 */
export const createSupplierForCoupleFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      shareToken: z.string().trim().min(32),
      supplier: createSupplierInputSchema,
    }),
  )
  .handler(async ({ data }) => {
    const existing = await getSupplierByEmail(data.supplier.email)
    if (existing) return existing

    return await createSupplier({
      id: crypto.randomUUID(),
      name: data.supplier.name,
      email: data.supplier.email,
      instagramHandle: data.supplier.instagramHandle,
      tiktokHandle: data.supplier.tiktokHandle,
      region: data.supplier.region,
    })
  })

