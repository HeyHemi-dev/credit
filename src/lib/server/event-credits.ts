import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import type { EventCreditPage, EventSupplier } from '@/lib/types/front-end'
import {
  createEventCreditSchema,
  deleteEventCreditSchema,
  getEventCreditsSchema,
  shareTokenSchema,
} from '@/lib/types/validation-schema'
import { getEventById } from '@/db/queries/events'
import { ERROR } from '@/lib/errors'
import {
  deleteEventSupplier,
  getEventSuppliersWithSupplier,
  upsertEventSupplier,
} from '@/db/queries/event-suppliers'
import { getSupplierById } from '@/db/queries/suppliers'

export const getEventCreditsFn = createServerFn({
  method: 'GET',
})
  .inputValidator(
    getEventCreditsSchema.extend({ shareToken: shareTokenSchema }),
  )
  .handler(async ({ data }): Promise<EventCreditPage> => {
    // get event

    const event = await getEventById(data.eventId)
    if (!event) throw ERROR.RESOURCE_NOT_FOUND('Event not found')

    if (event.shareToken !== data.shareToken)
      throw ERROR.FORBIDDEN('Share token mismatch')

    // get eventSuppliers
    const eventSuppliers = await getEventSuppliersWithSupplier(data.eventId)

    // compose eventCreditPage
    return {
      eventName: event.eventName,
      credits: eventSuppliers.map((es) => ({
        id: es.supplier.id,
        name: es.supplier.name,
        email: es.supplier.email,
        instagramHandle: es.supplier.instagramHandle,
        tiktokHandle: es.supplier.tiktokHandle,
        service: es.service,
        contributionNotes: es.contributionNotes,
      })),
    }
  })

export const createEventCreditFn = createServerFn({ method: 'POST' })
  .inputValidator(
    createEventCreditSchema.extend({ shareToken: shareTokenSchema }),
  )
  .handler(async ({ data }): Promise<EventSupplier> => {
    // check event and supplier exists
    const [event, supplier] = await Promise.all([
      getEventById(data.eventId),
      getSupplierById(data.supplierId),
    ])
    if (!supplier) throw ERROR.RESOURCE_NOT_FOUND('Supplier not found')
    if (!event) throw ERROR.RESOURCE_NOT_FOUND('Event not found')
    if (event.shareToken !== data.shareToken)
      throw ERROR.FORBIDDEN('Share token mismatch')

    // insert eventSupplier
    const eventSupplier = await upsertEventSupplier({
      eventId: data.eventId,
      supplierId: data.supplierId,
      service: data.service,
      contributionNotes: data.contributionNotes,
    })

    // compose eventSupplier
    return {
      id: supplier.id,
      name: supplier.name,
      email: supplier.email,
      instagramHandle: supplier.instagramHandle,
      tiktokHandle: supplier.tiktokHandle,
      service: eventSupplier.service,
      contributionNotes: eventSupplier.contributionNotes,
    }
  })

export const deleteEventCreditFn = createServerFn({ method: 'POST' })
  .inputValidator(
    deleteEventCreditSchema.extend({ shareToken: shareTokenSchema }),
  )
  .handler(async ({ data }): Promise<void> => {
    const event = await getEventById(data.eventId)
    if (!event) throw ERROR.RESOURCE_NOT_FOUND('Event not found')
    if (event.shareToken !== data.shareToken)
      throw ERROR.FORBIDDEN('Share token mismatch')

    // delete eventSupplier
    await deleteEventSupplier(data.eventId, data.supplierId)

    setResponseStatus(204)
    return
  })
