import {
  TRANSACTIONAL_EMAIL_FROM,
  sendTransactionalEmail,
} from '@/emails/email'

// TODO: replace "10 minsutes" with the constant
export async function sendSupplierClaimVerificationEmail({
  code,
  supplierEmail,
  supplierName,
}: {
  code: string
  supplierEmail: string
  supplierName: string
}) {
  await sendTransactionalEmail({
    from: TRANSACTIONAL_EMAIL_FROM,
    to: supplierEmail,
    subject: `Verify your claim for ${supplierName}`,
    text: [
      `Your With Thanks verification code is ${code}.`,
      '',
      `Enter this code in Account Settings to confirm that you own or manage ${supplierName}.`,
      '',
      'This code expires in 10 minutes.',
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n'),
    html: [
      `<p>Your With Thanks verification code is <strong>${code}</strong>.</p>`,
      `<p>Enter this code in Account Settings to confirm that you own or manage ${supplierName}.</p>`,
      '<p>This code expires in 10 minutes.</p>',
      '<p>If you did not request this, you can ignore this email.</p>',
    ].join(''),
  })
}
