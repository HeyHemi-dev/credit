import { describe, expect, it } from 'vitest'
import { sendTransactionalEmail } from '@/lib/server/email'
import { isIntegrationTestMode } from '@/testing/integration'

describe('Resend transactional email integration', () => {
  it.skipIf(!isIntegrationTestMode)(
    'sends to Resend test recipient and receives an email id',
    async () => {
      // Arrange
      const email = {
        html: [
          '<p>This is a transactional email integration test from With Thanks.</p>',
          '<p>If Resend accepts this message, the send path is configured correctly.</p>',
        ].join(''),
        subject: 'With Thanks email integration test',
        text: [
          'This is a transactional email integration test from With Thanks.',
          'If Resend accepts this message, the send path is configured correctly.',
        ].join('\n\n'),
        to: 'delivered+with-thanks-smoke@resend.dev',
      }

      // Act
      const result = await sendTransactionalEmail(email)

      // Assert
      expect(result.id).toEqual(expect.any(String))
      expect(result.id.length).toBeGreaterThan(0)
    },
  )
})
