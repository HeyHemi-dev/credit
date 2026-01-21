import type { AuthToken } from '@/lib/types/validation-schema'
import { ERROR } from '@/lib/errors'
import { isValidSession, isValidShareToken } from '@/db/queries/auth'

export async function isValidAuthToken(authToken: AuthToken) {
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
}
