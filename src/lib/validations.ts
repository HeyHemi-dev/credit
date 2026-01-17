import { z } from 'zod'
import { ERROR } from '@/lib/errors'
import { emptyStringToNull, optionalField } from '@/lib/empty-strings'
import { REGION, SERVICE, SHARE_LINK, VALIDATION } from '@/lib/constants'

/**
 * Normalization helpers
 */
export function normalizeHandle(input: string): string {
  return input.trim().replace(/^@+/, '').toLowerCase()
}

/**
 * Shared primitives
 */
export const shareTokenSchema = z
  .string()
  .trim()
  .min(
    SHARE_LINK.TOKEN.MIN_LENGTH,
    ERROR.VALIDATION_ERROR('Invalid share token').message,
  )

export const eventNameSchema = z
  .string()
  .trim()
  .min(1, ERROR.VALIDATION_ERROR('Event name is required').message)

export const weddingDateSchema = z
  .string()
  .trim()
  // date is stored as drizzle date; accept YYYY-MM-DD at API boundary
  .regex(/^\d{4}-\d{2}-\d{2}$/, ERROR.VALIDATION_ERROR('Invalid date').message)

export const regionSchema = z.enum(
  Object.values(REGION) as [string, ...Array<string>],
)
export const serviceSchema = z.enum(
  Object.values(SERVICE) as [string, ...Array<string>],
)

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email(ERROR.VALIDATION_ERROR('Invalid email').message)

export const handleSchema = z
  .string()
  .transform(normalizeHandle)
  .pipe(
    z
      .string()
      .regex(
        VALIDATION.HANDLE.REGEX,
        ERROR.VALIDATION_ERROR('Invalid handle').message,
      ),
  )

/**
 * Event
 */
export const createEventInputSchema = z.object({
  eventName: eventNameSchema,
  weddingDate: weddingDateSchema,
  region: optionalField(regionSchema).transform(emptyStringToNull),
})
export type CreateEventInput = z.infer<typeof createEventInputSchema>

/**
 * Supplier
 */
export const createSupplierInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, ERROR.VALIDATION_ERROR('Supplier name is required').message),
  email: emailSchema,
  instagramHandle: optionalField(handleSchema).transform(emptyStringToNull),
  tiktokHandle: optionalField(handleSchema).transform(emptyStringToNull),
  region: optionalField(regionSchema).transform(emptyStringToNull),
})
export type CreateSupplierInput = z.infer<typeof createSupplierInputSchema>

/**
 * Supplier search
 * Search by name, email, IG handle, TikTok handle.
 */
export const supplierSearchInputSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, ERROR.VALIDATION_ERROR('Search query required').message),
})
export type SupplierSearchInput = z.infer<typeof supplierSearchInputSchema>

/**
 * Event supplier
 */
export const upsertEventSupplierInputSchema = z.object({
  eventId: z.string().uuid(ERROR.VALIDATION_ERROR('Invalid event id').message),
  supplierId: z
    .string()
    .uuid(ERROR.VALIDATION_ERROR('Invalid supplier id').message),
  service: serviceSchema,
  contributionNotes: optionalField(z.string().trim()).transform(
    emptyStringToNull,
  ),
})
export type UpsertEventSupplierInput = z.infer<
  typeof upsertEventSupplierInputSchema
>
