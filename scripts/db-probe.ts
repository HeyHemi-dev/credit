import 'dotenv/config'

import { eq } from 'drizzle-orm'
import { events, userInNeonAuth } from '@/db/schema'
import { ERROR } from '@/lib/errors'
import { db } from '@/db/connection'

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) {
    throw ERROR.INVALID_STATE(`${name} is not set`)
  }
  return v
}

async function main() {
  const isWriteMode = process.argv.includes('--write')

  console.log('DB probe starting...')
  console.log(`DB probe mode: ${isWriteMode ? 'write' : 'read-only'}`)

  const testUserId = requireEnv('TEST_USER_ID')
  console.log('TEST_USER_ID set:', true)

  const [user] = await db
    .select({ id: userInNeonAuth.id, email: userInNeonAuth.email })
    .from(userInNeonAuth)
    .where(eq(userInNeonAuth.id, testUserId))
    .limit(1)
  if (!user.id)
    throw ERROR.RESOURCE_NOT_FOUND(`TEST_USER_ID does not exist: ${testUserId}`)
  console.log('read auth user ok:', true)

  if (isWriteMode) {
    const shareToken = crypto.randomUUID()

    const [inserted] = await db
      .insert(events)
      .values({
        createdByUserId: user.id,
        eventName: 'DB WRITE PROBE',
        weddingDate: '2026-01-01',
        region: null,
        shareToken,
      })
      .returning()
    console.log('inserted event id:', inserted.id ? true : false)

    const [selected] = await db
      .select({ id: events.id, shareToken: events.shareToken })
      .from(events)
      .where(eq(events.id, inserted.id))
      .limit(1)
    console.log('read-back ok:', selected?.id === inserted.id)

    await db.delete(events).where(eq(events.id, inserted.id))
    console.log('deleted ok:', true)
  }

  console.log('DB probe SUCCESS')
}

main().catch((err) => {
  console.error('DB probe FAILED')
  console.error(err)
  process.exitCode = 1
})
