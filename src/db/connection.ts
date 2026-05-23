import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { requireEnv } from '@/lib/env'

/**
 * Use the pooled Neon connection string for runtime (serverless-safe).
 * One module-level client per serverless invocation.
 */
const sql = neon(requireEnv('CR_DATABASE_URL'))

export const db = drizzle({ client: sql })
