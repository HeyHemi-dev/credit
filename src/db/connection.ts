import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
import { ERROR } from '@/lib/errors'

// Load from .env.local for local development
// Vercel automatically sets env vars for preview/production
if (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'development') {
  config({ path: '.env.local', override: true })
} else {
  config({ path: '.env' })
}

console.log('Attempting to connect with drizzle client')
if (!process.env.CR_DATABASE_URL) {
  throw ERROR.INVALID_STATE('Database URL is not set')
}

/**
 * Use the pooled Neon connection string for runtime (serverless-safe).
 * One module-level client per serverless invocation.
 */
const sql = neon(process.env.CR_DATABASE_URL)

export const db = drizzle({ client: sql })
