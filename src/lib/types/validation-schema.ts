import z from 'zod'
import { REGIONS, SERVICES } from '@/lib/constants'
import { optionalField } from '@/lib/empty-strings'

export const authUserIdSchema = z.uuid()
export type AuthUserId = z.infer<typeof authUserIdSchema>

export const regionSchema = z.enum(REGIONS)
export const serviceSchema = z.enum(SERVICES)

export const eventNameSchema = z
  .string()
  .trim()
  .min(1, 'Event name is required')

export const weddingDateSchema = z
  .string()
  .trim()
  // date is stored as drizzle date; accept YYYY-MM-DD at API boundary
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date')

// Event
export const nullableRegionSchema = regionSchema.nullable()
export const createEventFormSchema = z.object({
  eventName: eventNameSchema,
  weddingDate: weddingDateSchema,
  region: optionalField(regionSchema),
})
export type CreateEventForm = z.infer<typeof createEventFormSchema>

export const createEventSchema = createEventFormSchema.extend({
  region: nullableRegionSchema,
  authUserId: authUserIdSchema,
})
export type CreateEvent = z.infer<typeof createEventSchema>

export const getEventSchema = z.object({
  eventId: z.string().uuid(),
  authUserId: authUserIdSchema,
})
export type GetEvent = z.infer<typeof getEventSchema>

export const deleteEventSchema = z.object({
  eventId: z.string().uuid(),
  authUserId: authUserIdSchema,
})
export type DeleteEvent = z.infer<typeof deleteEventSchema>
