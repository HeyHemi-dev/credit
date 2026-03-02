import { createAuthClient } from '@neondatabase/neon-js/auth'
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react'
import { ERROR } from '@/lib/errors'

const AUTH_PROXY_URL =
  import.meta.env.VITE_NEON_AUTH_PROXY_URL ?? '/api/auth'
if (!AUTH_PROXY_URL) {
  throw ERROR.INVALID_STATE('VITE_NEON_AUTH_PROXY_URL is not set')
}

function resolveAuthClientBaseUrl() {
  // Normalize to a path so browser requests always stay same-origin.
  const proxyPath = (() => {
    if (/^https?:\/\//i.test(AUTH_PROXY_URL)) {
      const parsed = new URL(AUTH_PROXY_URL)
      return `${parsed.pathname}${parsed.search}`
    }
    return AUTH_PROXY_URL
  })()

  // Client: preserve first-party proxy behavior by resolving against current origin.
  if (typeof window !== 'undefined') {
    return new URL(proxyPath, window.location.origin).toString()
  }

  // Server render/dev worker: Better Auth requires an absolute URL.
  // Use absolute upstream URL as a safe fallback to avoid startup failures.
  const serverFallback = import.meta.env.VITE_NEON_AUTH_URL
  if (serverFallback && /^https?:\/\//i.test(serverFallback)) {
    return serverFallback
  }

  throw ERROR.INVALID_STATE(
    'Auth base URL must be absolute on the server. Set VITE_NEON_AUTH_URL.',
  )
}

export const authClient = createAuthClient(resolveAuthClientBaseUrl(), {
  adapter: BetterAuthReactAdapter(),
})
