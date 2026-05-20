import { Resend } from 'resend'
import { z } from 'zod'
import type { CreateEmailResponse } from 'resend'
import { EMAIL_FROM, RESEND_API_KEY } from '@/lib/env'
import { ERROR } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { tryCatch } from '@/lib/try-catch'

const transactionalEmailSchema = z.object({
  html: z.string().min(1),
  subject: z.string().min(1).max(200),
  text: z.string().min(1),
  to: z.email(),
})

export type TransactionalEmail = z.infer<typeof transactionalEmailSchema>

type EmailSender = {
  emails: {
    send: (payload: {
      from: string
      html: string
      subject: string
      text: string
      to: string
    }) => Promise<CreateEmailResponse>
  }
}

const resend = new Resend(RESEND_API_KEY)

function formatSender(emailAddress: string): string {
  return `With Thanks <${emailAddress}>`
}

export async function sendTransactionalEmail(
  input: TransactionalEmail,
  sender: EmailSender = resend,
) {
  const { data: email, error: validationError } =
    transactionalEmailSchema.safeParse(input)

  if (validationError) throw ERROR.VALIDATION_ERROR('Invalid email payload')

  const { data: response, error } = await tryCatch(
    sender.emails.send({
      from: formatSender(EMAIL_FROM),
      html: email.html,
      subject: email.subject,
      text: email.text,
      to: email.to,
    }),
  )

  if (error) {
    logger.error('email.send.request_failed', {
      errorName: error.name,
      recipientDomain: email.to.split('@')[1],
    })
    throw ERROR.NETWORK_ERROR('Email delivery failed')
  }

  if (response.error) {
    logger.error('email.send.provider_rejected', {
      errorName: response.error.name,
      statusCode: response.error.statusCode,
      recipientDomain: email.to.split('@')[1],
    })
    throw ERROR.NETWORK_ERROR('Email delivery failed')
  }

  return response.data
}
