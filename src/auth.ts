import { createAuthClient } from 'better-auth/react'
import { ERROR } from '@/lib/errors'

const AUTH_PROXY_URL = import.meta.env.VITE_NEON_AUTH_PROXY_URL ?? '/api/auth'

function normalizeProxyPath(rawProxyUrl: string) {
  const proxyPath = (() => {
    if (/^https?:\/\//i.test(rawProxyUrl)) {
      const parsed = new URL(rawProxyUrl)
      return `${parsed.pathname}${parsed.search}`
    }
    return rawProxyUrl
  })()

  // Back-compat: route all legacy neondb auth paths through the first-party proxy.
  if (/^\/neondb\/auth(?=\/|$)/.test(proxyPath)) {
    return proxyPath.replace(/^\/neondb\/auth(?=\/|$)/, '/api/auth')
  }

  // Guardrail: only allow the first-party proxy base path in this app.
  if (!/^\/api\/auth(?=\/|$)/.test(proxyPath)) {
    return '/api/auth'
  }

  return proxyPath
}

function resolveAuthClientBaseUrl() {
  const normalizedProxyPath = normalizeProxyPath(AUTH_PROXY_URL)

  // Client: always resolve first-party proxy against current origin.
  if (!import.meta.env.SSR) {
    return new URL(normalizedProxyPath, window.location.origin).toString()
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

const authClientBaseURL = resolveAuthClientBaseUrl()

if (import.meta.env.DEV && !import.meta.env.SSR) {
  console.info('[auth env]', {
    VITE_NEON_AUTH_PROXY_URL: import.meta.env.VITE_NEON_AUTH_PROXY_URL,
    VITE_NEON_AUTH_URL: import.meta.env.VITE_NEON_AUTH_URL,
  })
  console.info('[auth] better-auth client base URL', authClientBaseURL)
}

export const authClient = createAuthClient({
  baseURL: authClientBaseURL,
})
