import { createAuthClient } from '@neondatabase/neon-js/auth'
import { BetterAuthVanillaAdapter } from '@neondatabase/neon-js/auth/vanilla'
import type { AuthToken } from '@/lib/types/validation-schema'
import { ERROR } from '@/lib/errors'
import { isValidSession, isValidShareToken } from '@/db/queries/auth'

const VITE_NEON_AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL
if (!VITE_NEON_AUTH_URL) {
  throw ERROR.INVALID_STATE('VITE_NEON_AUTH_URL is not set')
}

export const authClient = createAuthClient(VITE_NEON_AUTH_URL, {
  adapter: BetterAuthVanillaAdapter(),
})

export async function isValidAuthToken(authToken: AuthToken) {
  console.log({ authToken })

  if (
    authToken.tokenType !== 'sessionToken' &&
    authToken.tokenType !== 'shareToken'
  ) {
    throw ERROR.NOT_AUTHENTICATED('Please log in to continue')
  }

  if (authToken.tokenType === 'shareToken') {
    const isValid = await isValidShareToken(authToken.token)
    if (!isValid)
      throw ERROR.NOT_AUTHENTICATED('Please request a new link to continue')
  }
  if (authToken.tokenType === 'sessionToken') {
    const isValid = await isValidSession(authToken.token)
    if (!isValid) throw ERROR.NOT_AUTHENTICATED('Please log in to continue')
  }

  return true
}
