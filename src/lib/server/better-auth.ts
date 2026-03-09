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

function resolveBetterAuthUrl() {
  const configured =
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
    'http://localhost:5173'

  const parsed = new URL(configured)
  return parsed.origin
}

const BETTER_AUTH_URL = resolveBetterAuthUrl()

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
