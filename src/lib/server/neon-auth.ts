import { ERROR } from '@/lib/errors'

const neonAuthBaseUrl =
  process.env.NEON_AUTH_BASE_URL ?? process.env.VITE_NEON_AUTH_URL
if (!neonAuthBaseUrl) {
  throw ERROR.INVALID_STATE(
    'NEON_AUTH_BASE_URL (or VITE_NEON_AUTH_URL fallback) is not set',
  )
}
const NEON_AUTH_BASE_URL: string = neonAuthBaseUrl

/** Resolves an auth endpoint path against the configured Neon Auth origin. */
function toAuthUrl(pathname: string) {
  const base = NEON_AUTH_BASE_URL.endsWith('/')
    ? NEON_AUTH_BASE_URL
    : `${NEON_AUTH_BASE_URL}/`

  return new URL(pathname.replace(/^\//, ''), base)
}

/**
 * Strips `Domain=...` from Set-Cookie.
 *
 * Intent: force host-scoped cookies when auth is proxied through this app
 * domain. This is the core first-party cookie invariant.
 */
function stripCookieDomainAttribute(cookie: string) {
  return cookie.replace(/;\s*Domain=[^;]+/gi, '')
}

/** Maps `/api/auth/*` request URLs to the equivalent Neon Auth upstream URL. */
function getNeonAuthProxyUrl(request: Request) {
  const incoming = new URL(request.url)
  const path = incoming.pathname.replace(/^\/api\/auth/, '') || '/'
  return toAuthUrl(`${path}${incoming.search}`)
}

/**
 * First-party auth proxy boundary.
 *
 * Contract:
 * - preserve upstream auth behavior (status/body/headers)
 * - normalize Set-Cookie to maintain host-scoped cookies
 * - avoid mutating semantics beyond transport safety header adjustments
 */
export async function proxyNeonAuthRequest(request: Request) {
  const upstreamUrl = getNeonAuthProxyUrl(request)
  const incoming = new URL(request.url)
  const headers = new Headers(request.headers)

  // Let fetch set content-length and avoid upstream host mismatch.
  headers.delete('content-length')
  headers.delete('host')
  headers.set('x-forwarded-host', incoming.host)
  headers.set('x-forwarded-proto', incoming.protocol.replace(':', ''))

  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    ...(request.body
      ? ({ body: request.body, duplex: 'half' } as const)
      : undefined),
    redirect: 'manual',
  })

  const responseHeaders = new Headers(upstreamResponse.headers)

  // Re-scope cookies to the app host by removing explicit Domain attributes.
  const getSetCookie = (
    upstreamResponse.headers as Headers & { getSetCookie?: () => Array<string> }
  ).getSetCookie

  if (typeof getSetCookie === 'function') {
    responseHeaders.delete('set-cookie')
    for (const cookie of getSetCookie.call(upstreamResponse.headers)) {
      responseHeaders.append('set-cookie', stripCookieDomainAttribute(cookie))
    }
  } else {
    const singleSetCookie = upstreamResponse.headers.get('set-cookie')
    if (singleSetCookie) {
      responseHeaders.set(
        'set-cookie',
        stripCookieDomainAttribute(singleSetCookie),
      )
    }
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  })
}

type SessionPayload = {
  user?: {
    id?: string
    email?: string | null
    name?: string | null
  }
  session?: {
    id?: string
    userId?: string
  }
}

type SessionEnvelope = { data?: SessionPayload | null }

/** Narrowing helper for endpoints that return `{ data: ... }` envelopes. */
function isSessionEnvelope(
  payload: SessionPayload | SessionEnvelope,
): payload is SessionEnvelope {
  return 'data' in payload
}

/** Normalizes response shape to a direct session payload. */
function unwrapSessionPayload(
  payload: SessionPayload | SessionEnvelope | null,
): SessionPayload | null {
  if (!payload) return null
  if (isSessionEnvelope(payload)) return payload.data ?? null
  return payload
}

/**
 * Reads session state from request cookies via Neon Auth.
 *
 * Contract:
 * - returns `null` for unauthenticated/invalid states
 * - returns only when both `user` and `session` are present
 *
 * This is intentionally conservative so downstream auth checks can treat
 * non-null as authenticated.
 */
export async function getServerSession(
  request: Request,
): Promise<SessionPayload | null> {
  const response = await fetch(toAuthUrl('/get-session'), {
    method: 'GET',
    headers: {
      cookie: request.headers.get('cookie') ?? '',
    },
  })

  if (!response.ok) return null

  const payload = (await response.json()) as
    | SessionPayload
    | SessionEnvelope
    | null

  const sessionData = unwrapSessionPayload(payload)

  if (!sessionData?.session || !sessionData?.user) return null
  return sessionData
}
