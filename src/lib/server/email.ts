import { Resend } from 'resend'
import type { CreateEmailOptions } from 'resend'
import { EMAIL_FROM, RESEND_API_KEY } from '@/lib/env'
import { ERROR } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { tryCatch } from '@/lib/try-catch'

type TextEmailOptions = Extract<CreateEmailOptions, { text: string }>

const resend = new Resend(RESEND_API_KEY)

export const TRANSACTIONAL_EMAIL_FROM = `With Thanks <${EMAIL_FROM}>`

export async function sendTransactionalEmail(
  input: TextEmailOptions,
) {
  const { data: response, error } = await tryCatch(resend.emails.send(input))

  if (error) {
    logger.error('email.send.request_failed', {
      errorName: error.name,
    })
    throw ERROR.NETWORK_ERROR('Email delivery failed')
  }

  if (response.error) {
    logger.error('email.send.provider_rejected', {
      errorName: response.error.name,
      statusCode: response.error.statusCode,
    })
    throw ERROR.NETWORK_ERROR('Email delivery failed')
  }

  return response.data
}
