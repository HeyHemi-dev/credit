import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import type { Credit } from '@/lib/types/front-end'
import {
  authTokenSchema,
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
import { isValidAuthToken } from '@/lib/server/auth'

export const createCreditFn = createServerFn({ method: 'POST' })
  .inputValidator(createCreditSchema.extend({ authToken: authTokenSchema }))
  .handler(async ({ data }): Promise<Credit> => {
    // Either session or share auth token is valid for creating a credit
    if (!isValidAuthToken(data.authToken)) throw ERROR.NOT_AUTHENTICATED()

    // check event and supplier exists
    const [event, supplier] = await Promise.all([
      getEventById(data.eventId),
      getSupplierById(data.supplierId),
    ])
    if (!event) throw ERROR.RESOURCE_NOT_FOUND('Event not found')
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
  .inputValidator(deleteCreditSchema.extend({ authToken: authTokenSchema }))
  .handler(async ({ data }): Promise<void> => {
    // Either session or share auth token is valid for deleting a credit
    if (!isValidAuthToken(data.authToken)) throw ERROR.NOT_AUTHENTICATED()

    const event = await getEventById(data.eventId)
    if (!event) throw ERROR.RESOURCE_NOT_FOUND('Event not found')

    // delete eventSupplier
    await deleteEventSupplier(data.eventId, data.supplierId)

    setResponseStatus(204)
    return
  })
