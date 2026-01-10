import { createAuthClient } from '@neondatabase/neon-js/auth'
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react'

const VITE_NEON_AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL
if (!VITE_NEON_AUTH_URL) {
  throw new Error('VITE_NEON_AUTH_URL is not set')
}

export const authClient = createAuthClient(VITE_NEON_AUTH_URL, {
  adapter: BetterAuthReactAdapter(),
})
