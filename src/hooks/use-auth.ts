import type { AuthToken } from '@/lib/types/validation-schema'
import { authClient } from '@/auth'
import { AUTH_STATUS, AUTH_TOKEN_TYPE } from '@/lib/constants'
import { ERROR } from '@/lib/errors'

// TODO: rename to useAuth
// useAuth could also return isSessionAuthToken and isShareAuthToken
// Rename the matching schema
// Create schema for session auth token and share auth token
// update api (hooks & server functions) to pass the correct auth tokens instead of authUserId
// server auth validation functions should be refactored as well.

// The goal is to make it easy to:
// - gate client side UI & submissions
// - pass tokens across the API boundary

// suggested Schema
// const authSchema = z.discriminatedUnion('status', [
//   z.object({ status: z.literal(AUTH_STATUS.PENDING) }),
//   z.object({ status: z.literal(AUTH_STATUS.UNAUTHENTICATED) }),
//   z.object({
//     status: z.literal(AUTH_STATUS.AUTHENTICATED),
//     authType: z.literal(AUTH_TOKEN_TYPE.SESSION_TOKEN), // we don't need to pass a session token, eventually, we will be able to verify the session server-side from cookies with a Neon helper.
//     authUserId: authUserIdSchema, // this is useful for fetching user-related data.
//   }),
//   z.object({
//     status: z.literal(AUTH_STATUS.AUTHENTICATED),
//     authType: z.literal(AUTH_TOKEN_TYPE.SHARE_TOKEN),
//     shareToken: shareTokenSchema, // we need to pass the token to verify it server-side.
//   })
// ])

// Note: session tokens are always more trusted than share tokens.
// Server auth functions should validate:
// - session tokens (for routes that require authentication)
// - session tokens OR share tokens (for routes that are shared)

/**
 * Hook to get the auth token from the session or the share token search param. * Use with authState component to display a loading state
 * or a message when the auth token is not found.
 * @param shareToken (optional) - The share token from search params
 * @returns The auth token
 */
export function useAuthToken(shareToken?: string): AuthToken {
  const { data, isPending } = authClient.useSession()

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

  if (data?.session.token) {
    return {
      status: AUTH_STATUS.AUTHENTICATED,
      tokenType: AUTH_TOKEN_TYPE.SESSION_TOKEN,
      token: data.session.token,
      authUserId: data.session.userId,
    }
  }

  return { status: AUTH_STATUS.UNAUTHENTICATED }
}

export function isSessionAuthToken(authToken: AuthToken) {
  return (
    authToken.status === AUTH_STATUS.AUTHENTICATED &&
    authToken.tokenType === AUTH_TOKEN_TYPE.SESSION_TOKEN
  )
}

export function requireSessionAuthToken(authToken: AuthToken) {
  if (!isSessionAuthToken(authToken)) throw ERROR.NOT_AUTHENTICATED()
  return authToken
}

export function isShareAuthToken(authToken: AuthToken) {
  return (
    authToken.status === AUTH_STATUS.AUTHENTICATED &&
    authToken.tokenType === AUTH_TOKEN_TYPE.SHARE_TOKEN
  )
}

export function requireShareAuthToken(authToken: AuthToken) {
  if (!isShareAuthToken(authToken))
    throw ERROR.NOT_AUTHENTICATED('Share token is required')
  return authToken
}
