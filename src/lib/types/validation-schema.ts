import z from 'zod'
import { REGIONS, SERVICES, SHARE_TOKEN_MIN_LENGTH } from '@/lib/constants'
import { optionalField } from '@/lib/empty-strings'

// ===============================
// Common Schemas
// ===============================

export const authUserIdSchema = z.uuid()
export type AuthUserId = z.infer<typeof authUserIdSchema>
export const sessionTokenSchema = z.string()
export const shareTokenSchema = z
  .string()
  .trim()
  .min(SHARE_TOKEN_MIN_LENGTH, 'Invalid share token')
export const authTokenSchema = z.object({
  token: z.union([sessionTokenSchema, shareTokenSchema]),
  tokenType: z.enum(['sessionToken', 'shareToken']),
})
export type AuthToken = z.infer<typeof authTokenSchema>
export const eventIdSchema = z.uuid()
export const regionSchema = z.enum(REGIONS, 'Invalid region')
export const serviceSchema = z.enum(SERVICES, 'Invalid service')
export const eventNameSchema = z
  .string()
  .trim()
  .min(1, 'Event name is required')
export const weddingDateSchema = z
  .string()
  .trim()
  // date is stored as drizzle date; accept YYYY-MM-DD at API boundary
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date')
export const supplierNameSchema = z
  .string()
  .trim()
  .min(1, 'Supplier name is required')
/**
 * Converts a string to a lowercase email address.
 */
export const emailSchema = z.email().toLowerCase().trim()
/**
 * Starts with @ symbol, followed by up to 30 characters.
 * Allowed characters: letters, numbers, periods (.), or underscores (_).
 */
export const instagramHandleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[@][a-z0-9._]{1,30}$/, 'Invalid Instagram handle')
/**
 * Starts with @ symbol, followed by up to 24 characters.
 * Allowed characters: letters, numbers, periods (.), or underscores (_).
 */
export const tiktokHandleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[@][a-z0-9._]{1,24}$/, 'Invalid TikTok handle')

/**
 * Strips the @ symbol from the beginning of a handle string.
 * Used when converting form values (with @) to API payloads (without @).
 */
function stripHandleAtSymbol(value: string): string {
  return value.replace(/^@+/, '')
}

// ===============================
// Events
// ===============================

export const createEventFormSchema = z.object({
  eventName: eventNameSchema,
  weddingDate: weddingDateSchema,
  region: optionalField(regionSchema),
})
export type CreateEventForm = z.infer<typeof createEventFormSchema>

export const createEventSchema = createEventFormSchema.extend({
  region: regionSchema.nullable(),
})
export type CreateEvent = z.infer<typeof createEventSchema>

export const getEventSchema = z.object({
  eventId: z.uuid(),
})
export type GetEvent = z.infer<typeof getEventSchema>

export const deleteEventSchema = z.object({
  eventId: z.uuid(),
})
export type DeleteEvent = z.infer<typeof deleteEventSchema>

// ===============================
// Suppliers
// ===============================

export const dedupeSuppliersSchema = z.object({
  name: supplierNameSchema,
  email: emailSchema,
})
export type DedupeSuppliers = z.infer<typeof dedupeSuppliersSchema>

export const searchSuppliersSchema = z.object({
  query: z.string().trim().min(1, 'Search query is required'),
})
export type SearchSuppliers = z.infer<typeof searchSuppliersSchema>

export const createSupplierFormSchema = z.object({
  name: supplierNameSchema,
  email: emailSchema,
  instagramHandle: optionalField(instagramHandleSchema),
  tiktokHandle: optionalField(tiktokHandleSchema),
  region: optionalField(regionSchema),
})
export type CreateSupplierForm = z.infer<typeof createSupplierFormSchema>

/**
 * Empty strings must be converted to null before validation.
 */
export const createSupplierSchema = createSupplierFormSchema.extend({
  instagramHandle: instagramHandleSchema
    .nullable()
    .transform((val) => val && stripHandleAtSymbol(val)),
  tiktokHandle: tiktokHandleSchema
    .nullable()
    .transform((val) => val && stripHandleAtSymbol(val)),
  region: regionSchema.nullable(),
})
export type CreateSupplier = z.infer<typeof createSupplierSchema>

// ===============================
// Event Credits
// ===============================

export const getCreditsSchema = z.object({
  eventId: eventIdSchema,
})

export const createCreditFormSchema = z.object({
  service: serviceSchema,
  supplierId: z.uuid(),
  contributionNotes: optionalField(
    z
      .string()
      .trim()
      .max(255, 'Contribution notes must be less than 255 characters'),
  ),
})
export type CreateCreditForm = z.infer<typeof createCreditFormSchema>

export const createCreditSchema = createCreditFormSchema.extend({
  service: serviceSchema,
  contributionNotes: z
    .string()
    .trim()
    .transform((val) => (val === '' ? null : val)),
  eventId: eventIdSchema,
})

export const deleteCreditFormSchema = z.object({
  supplierId: z.uuid(),
})
export type DeleteCreditForm = z.infer<typeof deleteCreditFormSchema>

export const deleteCreditSchema = z.object({
  eventId: eventIdSchema,
  supplierId: z.uuid(),
})
