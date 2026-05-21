import { eq } from 'drizzle-orm'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { db } from '@/db/connection'
import { events } from '@/db/schema'
import { logger } from '@/lib/logger'
import { auth } from '@/lib/server/better-auth'
import { tryCatch } from '@/lib/try-catch'
import { ERROR } from '@/lib/errors'

export async function getValidatedSession() {
  const { data, error } = await tryCatch(
    auth.api.getSession({
      headers: getRequestHeaders(),
    }),
  )

  if (error) {
    logger.error('auth.isValidSession.context.error', {
      error: error instanceof Error ? error.message : String(error),
    })
  }

  if (!data) return null
  if (data.session.expiresAt <= new Date()) return null

  return data
}

/**
 * Returns a validated session and user, or throws an error if the session is not found.
 */
export async function requireValidatedSession() {
  const result = await getValidatedSession()
  if (!result) throw ERROR.NOT_AUTHENTICATED()
  return result
}

export async function isValidSession() {
  const result = await getValidatedSession()
  return result !== null
}

export async function isValidShareToken(shareToken: string) {
  const count = await db.$count(events, eq(events.shareToken, shareToken))
  return count > 0
}
