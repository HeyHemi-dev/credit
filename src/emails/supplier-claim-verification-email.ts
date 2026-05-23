import {
  TRANSACTIONAL_EMAIL_FROM,
  sendTransactionalEmail,
} from '@/emails/email'
import { SUPPLIER_CLAIM_CODE_EXPIRY_MS } from '@/lib/constants'
import { formatDurationFromMs } from '@/lib/format-dates'

export async function sendSupplierClaimVerificationEmail({
  code,
  supplierEmail,
  supplierName,
}: {
  code: string
  supplierEmail: string
  supplierName: string
}) {
  const expiryDurationLabel = formatDurationFromMs(
    SUPPLIER_CLAIM_CODE_EXPIRY_MS,
  )

  await sendTransactionalEmail({
    from: TRANSACTIONAL_EMAIL_FROM,
    to: supplierEmail,
    subject: `Verify your claim for ${supplierName}`,
    text: [
      `Your With Thanks verification code is ${code}.`,
      '',
      `Enter this code in Account Settings to confirm that you own or manage ${supplierName}.`,
      '',
      `This code expires in ${expiryDurationLabel}.`,
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n'),
    html: [
      `<p>Your With Thanks verification code is <strong>${code}</strong>.</p>`,
      `<p>Enter this code in Account Settings to confirm that you own or manage ${supplierName}.</p>`,
      `<p>This code expires in ${expiryDurationLabel}.</p>`,
      '<p>If you did not request this, you can ignore this email.</p>',
    ].join(''),
  })
}
