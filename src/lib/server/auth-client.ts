import { createAuthClient } from '@neondatabase/neon-js/auth'
import { ERROR } from '@/lib/errors'

const VITE_NEON_AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL
if (!VITE_NEON_AUTH_URL) {
  throw ERROR.INVALID_STATE('VITE_NEON_AUTH_URL is not set')
}

export const authClient = createAuthClient(VITE_NEON_AUTH_URL)

export async function authUserId(): Promise<string | null> {
  console.log('authUserId', authClient)

  const { data } = await authClient.getSession()
  console.log('authUserId data', data)
  if (!data) return null
  return data.session.userId
}
