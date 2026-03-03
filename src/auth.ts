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

  // Back-compat: remap legacy Neon path to the app's first-party auth proxy.
  if (/^\/neondb\/auth(?=\/|$)/.test(proxyPath)) {
    return proxyPath.replace(/^\/neondb\/auth(?=\/|$)/, DEFAULT_AUTH_PROXY_PATH)
  }

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

const authProxyPath = resolveAuthProxyPath()
const authClientBaseURL = resolveAuthClientBaseUrl()

if (import.meta.env.DEV && !import.meta.env.SSR) {
  console.info('[auth env]', {
    VITE_NEON_AUTH_PROXY_URL: import.meta.env.VITE_NEON_AUTH_PROXY_URL,
  })
  console.info('[auth] better-auth client base URL', authClientBaseURL)
  console.info('[auth] better-auth proxy path', authProxyPath)
}

export const authClient = createAuthClient({
  baseURL: authClientBaseURL,
  basePath: authProxyPath,
})
