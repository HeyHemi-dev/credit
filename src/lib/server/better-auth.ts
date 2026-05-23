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
import { AUTH_ALLOWED_HOSTS, AUTH_API_BASE_PATH } from '@/lib/auth-constants'
import { requireEnv } from '@/lib/env'

export const auth = betterAuth({
  baseURL: {
    allowedHosts: [...AUTH_ALLOWED_HOSTS],
  },
  basePath: AUTH_API_BASE_PATH,
  secret: requireEnv('AUTH_SECRET'),
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
      clientId: requireEnv('GOOGLE_CLIENT_ID'),
      clientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
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
