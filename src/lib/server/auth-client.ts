// import { createAuthClient } from '@neondatabase/neon-js/auth'
// import { BetterAuthVanillaAdapter } from '@neondatabase/neon-js/auth/vanilla'
// import { logger } from '@/lib/logger'
// import { ERROR } from '@/lib/errors'

// const VITE_NEON_AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL
// if (!VITE_NEON_AUTH_URL) {
//   throw ERROR.INVALID_STATE('VITE_NEON_AUTH_URL is not set')
// }

// export const authClient = createAuthClient(VITE_NEON_AUTH_URL, {
//   adapter: BetterAuthVanillaAdapter(),
// })

// export async function authUserId(): Promise<string | null> {
//   const { data, error } = await authClient.getSession()
//   if (!data || error) {
//     logger.error('authClient.getSession', { error, data })
//     return null
//   }
//   return data.session.userId
// }
