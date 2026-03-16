import 'dotenv/config'

import { desc, eq } from 'drizzle-orm'
import { db } from '../src/db/connection'
import { events, userInNeonAuth } from '../src/db/schema'

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) {
    throw new Error(`Missing env var: ${name}`)
  }
  return v
}

function isWriteProbe() {
  return process.argv.includes('--write')
}

async function readProbe() {
  const [user] = await db
    .select({ id: userInNeonAuth.id, email: userInNeonAuth.email })
    .from(userInNeonAuth)
    .orderBy(desc(userInNeonAuth.createdAt))
    .limit(1)

  console.log('DB probe mode: read-only')
  console.log('CR_DATABASE_URL set:', true)
  console.log('auth table read ok:', true)

  if (user) {
    console.log('latest neon_auth.user:', user.email ?? user.id)
  } else {
    console.log('No neon_auth.user rows found.')
  }

  console.log('DB probe SUCCESS')
}

async function resolveUserId(): Promise<string> {
  const userId = requireEnv('TEST_USER_ID')

  const [user] = await db
    .select({ id: userInNeonAuth.id, email: userInNeonAuth.email })
    .from(userInNeonAuth)
    .where(eq(userInNeonAuth.id, userId))
    .limit(1)

  if (!user?.id) {
    throw new Error(`TEST_USER_ID does not exist in neon_auth.user: ${userId}`)
  }

  console.log('Using neon_auth.user:', user.email ?? user.id)
  return user.id
}

async function writeProbe() {
  const createdByUserId = await resolveUserId()
  const id = crypto.randomUUID()
  const shareToken = crypto.randomUUID()

  console.log('DB probe mode: write')
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

async function main() {
  // Ensures src/db/connection.ts won't throw without env.
  requireEnv('CR_DATABASE_URL')

  console.log('DB probe starting...')
  if (isWriteProbe()) {
    await writeProbe()
    return
  }

  await readProbe()
}

main().catch((err) => {
  console.error('DB probe FAILED')
  console.error(err)
  process.exitCode = 1
})
