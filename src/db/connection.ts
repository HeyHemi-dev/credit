import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { ERROR } from '@/lib/errors'

if (!process.env.CR_DATABASE_URL) {
  throw ERROR.INVALID_STATE('Database URL is not set')
}

/**
 * Use the pooled Neon connection string for runtime (serverless-safe).
 * One module-level client per serverless invocation.
 */
const sql = neon(process.env.CR_DATABASE_URL)

export const db = drizzle({ client: sql })
