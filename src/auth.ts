import { createAuthClient } from '@neondatabase/neon-js/auth'
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react'
import { ERROR } from '@/lib/errors'

const VITE_NEON_AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL
if (!VITE_NEON_AUTH_URL) {
  throw ERROR.INVALID_STATE('VITE_NEON_AUTH_URL is not set')
}

export const authClient = createAuthClient(VITE_NEON_AUTH_URL, {
  adapter: BetterAuthReactAdapter(),
})
