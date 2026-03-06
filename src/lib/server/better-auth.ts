import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { db } from '@/db/connection'
import {
  accountInNeonAuth,
  jwksInNeonAuth,
  memberInNeonAuth,
  organizationInNeonAuth,
  sessionInNeonAuth,
  userInNeonAuth,
  verificationInNeonAuth,
} from '@/db/schema'
import { ERROR } from '@/lib/errors'

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw ERROR.INVALID_STATE(`${name} is not set`)
  }
  return value
}

const AUTH_SECRET = requiredEnv('AUTH_SECRET')
const GOOGLE_CLIENT_ID = requiredEnv('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = requiredEnv('GOOGLE_CLIENT_SECRET')
const BETTER_AUTH_URL =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
  'http://localhost:5173'

export const auth = betterAuth({
  baseURL: BETTER_AUTH_URL,
  basePath: '/api/auth',
  secret: AUTH_SECRET,
  trustedOrigins: [
    'http://localhost:5173',
    'https://localhost',
    'https://*.vercel.app',
  ],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: userInNeonAuth,
      session: sessionInNeonAuth,
      account: accountInNeonAuth,
      verification: verificationInNeonAuth,
      jwks: jwksInNeonAuth,
      organization: organizationInNeonAuth,
      member: memberInNeonAuth,
    },
  }),
  session: {
    // Keep existing behavior close to Better Auth defaults.
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  socialProviders: {
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      accessType: 'offline',
      prompt: 'select_account',
    },
  },
  plugins: [tanstackStartCookies()],
  advanced: {
    trustedProxyHeaders: true,
    useSecureCookies: process.env.NODE_ENV === 'production',
    database: {
      generateId: 'uuid',
    },
  },
})

type SessionPayload = {
  user?: {
    id?: string
    email?: string | null
    name?: string | null
  }
  session?: {
    id?: string
    userId?: string
    token?: string
  }
}

type SessionEnvelope = { data?: SessionPayload | null }

function isSessionEnvelope(
  payload: SessionPayload | SessionEnvelope,
): payload is SessionEnvelope {
  return 'data' in payload
}

function unwrapSessionPayload(
  payload: SessionPayload | SessionEnvelope | null,
): SessionPayload | null {
  if (!payload) return null
  if (isSessionEnvelope(payload)) return payload.data ?? null
  return payload
}

/**
 * Resolve session from request cookies through local Better Auth handler.
 * Avoids any upstream Neon auth network dependency.
 */
export async function getServerSession(
  request: Request,
): Promise<SessionPayload | null> {
  const url = new URL(request.url)
  const sessionRequest = new Request(`${url.origin}/api/auth/get-session`, {
    method: 'GET',
    headers: {
      cookie: request.headers.get('cookie') ?? '',
    },
  })

  const response = await auth.handler(sessionRequest)
  if (!response.ok) return null

  const payload = (await response.json()) as
    | SessionPayload
    | SessionEnvelope
    | null
  const sessionData = unwrapSessionPayload(payload)

  if (!sessionData?.session || !sessionData?.user) return null
  return sessionData
}
