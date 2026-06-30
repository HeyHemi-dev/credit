import type { AuthToken } from '@/lib/types/validation-schema'
import { authClient } from '@/auth'
import { AUTH_STATUS, AUTH_TOKEN_TYPE } from '@/lib/constants'
import { ERROR } from '@/lib/errors'

/**
 * Hook to get the auth token from the session or the share token search param. * Use with authState component to display a loading state
 * or a message when the auth token is not found.
 * @param shareToken (optional) - The share token from search params
 * @returns The auth token
 */
export function useAuth(shareToken?: string): AuthToken {
  const { data, isPending } = authClient.useSession()
  const sessionToken = data?.session?.token

  // Early return for share token
  if (shareToken) {
    return {
      status: AUTH_STATUS.AUTHENTICATED,
      tokenType: AUTH_TOKEN_TYPE.SHARE_TOKEN,
      token: shareToken,
    }
  }

  if (isPending) {
    return { status: AUTH_STATUS.PENDING }
  }

  if (sessionToken) {
    return {
      status: AUTH_STATUS.AUTHENTICATED,
      tokenType: AUTH_TOKEN_TYPE.SESSION_TOKEN,
      token: sessionToken,
      authUserId: data.session?.userId,
    }
  }

  return { status: AUTH_STATUS.UNAUTHENTICATED }
}

export function isSessionAuth(authToken: AuthToken) {
  return (
    authToken.status === AUTH_STATUS.AUTHENTICATED &&
    authToken.tokenType === AUTH_TOKEN_TYPE.SESSION_TOKEN
  )
}

export function requireSessionAuth(authToken: AuthToken) {
  if (!isSessionAuth(authToken)) throw ERROR.NOT_AUTHENTICATED()
  return authToken
}

export function isShareAuth(authToken: AuthToken) {
  return (
    authToken.status === AUTH_STATUS.AUTHENTICATED &&
    authToken.tokenType === AUTH_TOKEN_TYPE.SHARE_TOKEN
  )
}

export function requireShareAuth(authToken: AuthToken) {
  if (!isShareAuth(authToken))
    throw ERROR.NOT_AUTHENTICATED('Share token is required')
  return authToken
}
