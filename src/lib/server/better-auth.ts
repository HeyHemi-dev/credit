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
import {
  AUTH_API_BASE_PATH,
  AUTH_ALLOWED_HOSTS,
} from '@/lib/auth-constants'
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

export const auth = betterAuth({
  baseURL: {
    allowedHosts: [...AUTH_ALLOWED_HOSTS],
  },
  basePath: AUTH_API_BASE_PATH,
  secret: AUTH_SECRET,
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
