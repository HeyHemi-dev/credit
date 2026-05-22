import {
  TRANSACTIONAL_EMAIL_FROM,
  sendTransactionalEmail,
} from '@/emails/email'

// TODO: improve email copy
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
    subject: `Verify your ${supplierName} supplier claim`,
    text: [
      `Your With Thanks supplier claim code is ${code}.`,
      'Enter this 6-character code in account settings to verify your claim.',
      'This code expires in 10 minutes.',
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n'),
    html: [
      `<p>Your With Thanks supplier claim code is <strong>${code}</strong>.</p>`,
      '<p>Enter this 6-character code in account settings to verify your claim.</p>',
      '<p>This code expires in 10 minutes.</p>',
      '<p>If you did not request this, you can ignore this email.</p>',
    ].join(''),
  })
}
