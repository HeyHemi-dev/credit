// src/db.ts
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
import { ERROR } from '@/lib/errors'

config({ path: '.env' }) // or .env.local

// Load from .env.local for local development
// Vercel automatically sets env vars for preview/production
if (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'development') {
  config({ path: '.env.local', override: true })
}

console.log('Attempting to connect with drizzle client')
if (!process.env.CR_DATABASE_URL) {
  throw ERROR.INVALID_STATE('Database URL is not set')
}

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle({ client: sql })
