import type { AuthToken } from '@/lib/types/validation-schema'
import { authClient } from '@/auth'
import { AUTH_STATUS, AUTH_TOKEN_TYPE } from '@/lib/constants'

/**
 * Hook to get the auth token from the session or the share token search param. * Use with authState component to display a loading state
 * or a message when the auth token is not found.
 * @param shareToken (optional) - The share token from search params
 * @returns The auth token
 */
export function useAuthToken(shareToken?: string): AuthToken {
  const { data, isPending, isRefetching } = authClient.useSession()

  if (isPending || isRefetching) {
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

  if (shareToken) {
    return {
      status: AUTH_STATUS.AUTHENTICATED,
      tokenType: AUTH_TOKEN_TYPE.SHARE_TOKEN,
      token: shareToken,
    }
  }

  return { status: AUTH_STATUS.UNAUTHENTICATED }
}
