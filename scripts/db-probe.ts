import 'dotenv/config'

import { eq } from 'drizzle-orm'
import { userInNeonAuth } from '@/db/schema'
import { REGION, SHARE_TOKEN_MIN_LENGTH } from '@/lib/constants'
import { ERROR } from '@/lib/errors'
import { generateToken } from '@/lib/generate-token'
import { db } from '@/db/connection'
import { requireEnv } from '@/lib/env'

import { createEvent, deleteEvent, getEventById } from '@/db/queries/events'
import { formatDateToDrizzleDateString } from '@/lib/format-dates'

async function readUser(userId: string) {
  const [user] = await db
    .select({ id: userInNeonAuth.id, email: userInNeonAuth.email })
    .from(userInNeonAuth)
    .where(eq(userInNeonAuth.id, userId))
    .limit(1)

  if (!user.id) throw ERROR.RESOURCE_NOT_FOUND(`user does not exist: ${userId}`)
}

async function main() {
  const isWriteMode = process.argv.includes('--write')
  console.log(`DB probe mode: ${isWriteMode ? 'write' : 'read-only'}`)

  const testUserId = requireEnv('TEST_USER_ID')
  console.log('TEST_USER_ID set:', true)

  readUser(testUserId)
  console.log('read user ok:', true)

  if (isWriteMode) {
    const event = await createEvent({
      createdByUserId: testUserId,
      eventName: 'DB WRITE PROBE',
      weddingDate: formatDateToDrizzleDateString(new Date()),
      region: REGION.AUCKLAND,
      shareToken: generateToken(SHARE_TOKEN_MIN_LENGTH),
    })
    console.log('create event ok:', event.id ? true : false)

    const readEvent = await getEventById(event.id)
    console.log('read event ok:', readEvent?.id === event.id)

    await deleteEvent(event.id, testUserId)
    console.log('delete event ok:', true)
  }

  console.log('DB probe SUCCESS')
}

main().catch((error) => {
  console.error('DB probe FAILED')
  console.error(error)
  process.exitCode = 1
})
