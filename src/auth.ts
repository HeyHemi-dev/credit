import { createAuthClient } from 'better-auth/react'
import { AUTH_API_BASE_PATH, LOCAL_DEV_ORIGIN } from '@/lib/auth-constants'

function resolveAuthClientBaseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // `Route.ssr = false` means this client is only consumed in the browser.
  // Keep an absolute fallback for server-side module evaluation only.
  return LOCAL_DEV_ORIGIN
}

const authClientBaseURL = resolveAuthClientBaseUrl()

export const authClient = createAuthClient({
  baseURL: authClientBaseURL,
  basePath: AUTH_API_BASE_PATH,
})
