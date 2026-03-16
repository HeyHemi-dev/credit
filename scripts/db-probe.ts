import 'dotenv/config'

import { eq } from 'drizzle-orm'
import { events, userInNeonAuth } from '@/db/schema'

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) {
    throw new Error(`Missing env var: ${name}`)
  }
  return v
}

async function main() {
  const write = process.argv.includes('--write')

  console.log('DB probe starting...')
  console.log(`DB probe mode: ${write ? 'write' : 'read-only'}`)

  requireEnv('CR_DATABASE_URL')
  console.log('CR_DATABASE_URL set:', true)

  const testUserId = requireEnv('TEST_USER_ID')
  const { db } = await import('../src/db/connection')

  const [user] = await db
    .select({ id: userInNeonAuth.id, email: userInNeonAuth.email })
    .from(userInNeonAuth)
    .where(eq(userInNeonAuth.id, testUserId))
    .limit(1)

  if (!user?.id) {
    throw new Error(`TEST_USER_ID does not exist in neon_auth.user: ${testUserId}`)
  }

  console.log('auth table read ok:', true)
  console.log('using TEST_USER_ID:', user.email ?? user.id)

  if (write) {
    const id = crypto.randomUUID()
    const shareToken = crypto.randomUUID()

    console.log('createdByUserId:', user.id)

    const [inserted] = await db
      .insert(events)
      .values({
        id,
        createdByUserId: user.id,
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
  }

  console.log('DB probe SUCCESS')
}

main().catch((err) => {
  console.error('DB probe FAILED')
  console.error(err)
  process.exitCode = 1
})
