import 'dotenv/config'

import { eq } from 'drizzle-orm'
import { events, userInNeonAuth } from '@/db/schema'
import { SHARE_TOKEN_MIN_LENGTH } from '@/lib/constants'
import { ERROR } from '@/lib/errors'
import { generateToken } from '@/lib/generate-token'
import { db } from '@/db/connection'

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) {
    throw ERROR.INVALID_STATE(`${name} is not set`)
  }
  return v
}

async function readUser(userId: string) {
  const [user] = await db
    .select({ id: userInNeonAuth.id, email: userInNeonAuth.email })
    .from(userInNeonAuth)
    .where(eq(userInNeonAuth.id, userId))
    .limit(1)

  if (!user.id)
    throw ERROR.RESOURCE_NOT_FOUND(`TEST_USER_ID does not exist: ${userId}`)
}

async function createEvent(userId: string): Promise<string> {
  const [event] = await db
    .insert(events)
    .values({
      createdByUserId: userId,
      eventName: 'DB WRITE PROBE',
      weddingDate: '2026-01-01',
      region: null,
      shareToken: generateToken(SHARE_TOKEN_MIN_LENGTH),
    })
    .returning()

  return event.id
}

async function readEvent(eventId: string): Promise<string> {
  const [event] = await db
    .select({ id: events.id, shareToken: events.shareToken })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)

  return event.id
}

async function deleteEvent(eventId: string) {
  await db.delete(events).where(eq(events.id, eventId))
}

async function main() {
  const isWriteMode = process.argv.includes('--write')

  console.log('DB probe starting...')
  console.log(`DB probe mode: ${isWriteMode ? 'write' : 'read-only'}`)

  const testUserId = requireEnv('TEST_USER_ID')
  console.log('TEST_USER_ID set:', true)

  readUser(testUserId)
  console.log('read user ok:', true)

  if (isWriteMode) {
    const eventId = await createEvent(testUserId)
    console.log('create event ok:', eventId ? true : false)

    const readEventId = await readEvent(eventId)
    console.log('read event ok:', readEventId === eventId)

    await deleteEvent(eventId)
    console.log('delete event ok:', true)
  }

  console.log('DB probe SUCCESS')
}

main().catch((err) => {
  console.error('DB probe FAILED')
  console.error(err)
  process.exitCode = 1
})
