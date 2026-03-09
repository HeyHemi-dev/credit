import { createAuthClient } from 'better-auth/react'

const DEFAULT_AUTH_PROXY_PATH = '/api/auth'
const DEV_SERVER_ORIGIN_FALLBACK = 'http://localhost:5173'

function resolveAuthProxyPath() {
  const configuredPath =
    import.meta.env.VITE_NEON_AUTH_PROXY_URL ?? DEFAULT_AUTH_PROXY_PATH
  const proxyPath = (() => {
    if (/^https?:\/\//i.test(configuredPath)) {
      const parsed = new URL(configuredPath)
      return `${parsed.pathname}${parsed.search}`
    }
    return configuredPath
  })()

  if (!/^\/api\/auth(?=\/|$)/.test(proxyPath)) {
    return DEFAULT_AUTH_PROXY_PATH
  }

  return proxyPath
}

function resolveAuthClientBaseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // `Route.ssr = false` means this client is only consumed in the browser.
  // Keep an absolute fallback for server-side module evaluation only.
  return DEV_SERVER_ORIGIN_FALLBACK
}

const authClientBaseURL = resolveAuthClientBaseUrl()
const authProxyPath = resolveAuthProxyPath()

export const authClient = createAuthClient({
  baseURL: authClientBaseURL,
  basePath: authProxyPath,
})
