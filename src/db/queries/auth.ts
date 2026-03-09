import { eq } from 'drizzle-orm'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { db } from '@/db/connection'
import { events } from '@/db/schema'
import { logger } from '@/lib/logger'
import { auth } from '@/lib/server/better-auth'
import { tryCatch } from '@/lib/try-catch'

export async function isValidSession(sessionToken: string) {
  const { data, error } = await tryCatch(
    auth.api.getSession({
      headers: getRequestHeaders(),
    }),
  )

  if (error) {
    logger.error('auth.isValidSession.context.error', {
      sessionToken,
      error: error instanceof Error ? error.message : String(error),
    })
  } else if (!data) {
    logger.info('auth.isValidSession.context.noSession', {
      sessionToken,
      hasBetterAuthSession: false,
    })
  } else {
    logger.info('auth.isValidSession.context', {
      sessionToken,
      hasBetterAuthSession: true,
      betterAuthSession: data.session.token,
      betterAuthUserId: data.user.id,
    })
  }

  // Keep current auth behavior for this PR. Next step can enforce Better Auth session.
  return sessionToken.length > 0
}

export async function isValidShareToken(shareToken: string) {
  const count = await db.$count(events, eq(events.shareToken, shareToken))
  return count > 0
}
