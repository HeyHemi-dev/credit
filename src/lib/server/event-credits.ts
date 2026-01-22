import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import type { Credit } from '@/lib/types/front-end'
import {
  createCreditSchema,
  deleteCreditSchema,
  shareTokenSchema,
} from '@/lib/types/validation-schema'
import { getEventById } from '@/db/queries/events'
import { ERROR } from '@/lib/errors'
import {
  deleteEventSupplier,
  upsertEventSupplier,
} from '@/db/queries/event-suppliers'
import { getSupplierById } from '@/db/queries/suppliers'

export const createCreditFn = createServerFn({ method: 'POST' })
  .inputValidator(createCreditSchema.extend({ shareToken: shareTokenSchema }))
  .handler(async ({ data }): Promise<Credit> => {
    // check event and supplier exists
    const [event, supplier] = await Promise.all([
      getEventById(data.eventId),
      getSupplierById(data.supplierId),
    ])
    if (!event) throw ERROR.RESOURCE_NOT_FOUND('Event not found')
    if (event.shareToken !== data.shareToken)
      throw ERROR.FORBIDDEN('Share token mismatch')
    if (!supplier) throw ERROR.RESOURCE_NOT_FOUND('Supplier not found')

    // insert eventSupplier
    const eventSupplier = await upsertEventSupplier({
      eventId: data.eventId,
      supplierId: data.supplierId,
      service: data.service,
      contributionNotes: data.contributionNotes,
    })

    // compose Credit
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

export const deleteCreditFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteCreditSchema.extend({ shareToken: shareTokenSchema }))
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
