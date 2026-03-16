import 'dotenv/config'

import { eq } from 'drizzle-orm'
import { db } from '../src/db/connection'
import { events } from '../src/db/schema'

// Hemi's hardcoded user ID for testing.
const TEST_USER_ID = 'ba941d5f-79ea-4130-b0aa-f5996e2c154b'

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) {
    throw new Error(`Missing env var: ${name}`)
  }
  return v
}

async function main() {
  // Ensures src/db/connection.ts won't throw without env.
  requireEnv('CR_DATABASE_URL')

  const createdByUserId = TEST_USER_ID

  const id = crypto.randomUUID()
  const shareToken = crypto.randomUUID()

  console.log('DB probe starting...')
  console.log('CR_DATABASE_URL set:', true)
  console.log('createdByUserId:', createdByUserId)

  const [inserted] = await db
    .insert(events)
    .values({
      id,
      createdByUserId,
      eventName: 'DB WRITE PROBE',
      weddingDate: '2026-01-01',
      region: null,
      shareToken,
    })
    .returning()

  console.log('inserted event id:', inserted?.id ?? '(missing)')

  const [selected] = await db
    .select({ id: events.id, shareToken: events.shareToken })
    .from(events)
    .where(eq(events.id, id))
    .limit(1)

  console.log('read-back ok:', selected?.id === id)

  await db.delete(events).where(eq(events.id, id))
  console.log('deleted ok:', true)

  console.log('DB probe SUCCESS')
}

main().catch((err) => {
  console.error('DB probe FAILED')
  console.error(err)
  process.exitCode = 1
})
