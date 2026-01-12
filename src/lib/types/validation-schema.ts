import z from 'zod'
import { REGIONS, SERVICES } from '@/lib/constants'
import { optionalField } from '@/lib/empty-strings'

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

export const createEventSchema = z.object({
  eventName: eventNameSchema,
  weddingDate: weddingDateSchema,
  region: regionSchema,
})
export type CreateEvent = z.infer<typeof createEventSchema>

export const createEventFormSchema = createEventSchema.extend({
  region: optionalField(regionSchema),
})
export type CreateEventForm = z.infer<typeof createEventFormSchema>
