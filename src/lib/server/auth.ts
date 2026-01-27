import { createAuthClient } from '@neondatabase/neon-js/auth'
import { BetterAuthVanillaAdapter } from '@neondatabase/neon-js/auth/vanilla'
import type { AuthToken } from '@/lib/types/validation-schema'
import { ERROR } from '@/lib/errors'
import { isValidSession, isValidShareToken } from '@/db/queries/auth'
import { AUTH_STATUS, AUTH_TOKEN_TYPE } from '@/lib/constants'

const VITE_NEON_AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL
if (!VITE_NEON_AUTH_URL) {
  throw ERROR.INVALID_STATE('VITE_NEON_AUTH_URL is not set')
}

export const authClient = createAuthClient(VITE_NEON_AUTH_URL, {
  adapter: BetterAuthVanillaAdapter(),
})

export async function isValidAuthToken(authToken: AuthToken) {
  if (authToken.status !== AUTH_STATUS.AUTHENTICATED) {
    return false
  }

  // Gate in case future token types are added
  if (
    authToken.tokenType !== AUTH_TOKEN_TYPE.SESSION_TOKEN &&
    authToken.tokenType !== AUTH_TOKEN_TYPE.SHARE_TOKEN
  ) {
    return false
  }

  if (authToken.tokenType === 'shareToken') {
    const isValid = await isValidShareToken(authToken.token)
    if (!isValid) return false
  }

  if (authToken.tokenType === 'sessionToken') {
    const isValid = await isValidSession(authToken.token)
    if (!isValid) return false
  }

  return true
}
