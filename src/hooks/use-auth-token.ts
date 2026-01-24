import { authClient } from '@/auth'
import { resolveAuthToken } from '@/lib/utils'

/**
 * Hook to get the auth token from the session or the share token search param. * Use with authState component to display a loading state
 * or a message when the auth token is not found.
 * @param shareToken (optional) - The share token from search params
 * @returns The auth token
 */
export function useAuthToken(shareToken?: string) {
  const { data, isPending, isRefetching } = authClient.useSession()

  return resolveAuthToken({
    isPending: isPending || isRefetching,
    sessionToken: data?.session.token,
    shareToken,
  })
}
