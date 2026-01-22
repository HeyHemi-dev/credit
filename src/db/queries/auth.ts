import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/db/connection'
import { events, sessionInNeonAuth } from '@/db/schema'

export async function isValidSession(sessionToken: string) {
  return sessionToken.length > 0
  const any = await db
    .select()
    .from(sessionInNeonAuth)
    .where(eq(sessionInNeonAuth.token, sessionToken))
  console.log({ any })

  const count = await db.$count(
    sessionInNeonAuth,
    and(
      eq(sessionInNeonAuth.token, sessionToken),
      sql`${sessionInNeonAuth.expiresAt} > CURRENT_TIMESTAMP`,
    ),
  )
  return count > 0
}

export async function isValidShareToken(shareToken: string) {
  const count = await db.$count(events, eq(events.shareToken, shareToken))
  return count > 0
}
