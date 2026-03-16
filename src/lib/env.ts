import { config } from 'dotenv'
import { ERROR } from '@/lib/errors'

// Load from .env.local for local development
// Vercel automatically sets env vars for preview/production
if (!process.env.VERCEL) {
  config({ path: '.env.local' })
}

export function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw ERROR.INVALID_STATE(`${key} is not set`)
  }
  return value
}

export const AUTH_SECRET = requireEnv('AUTH_SECRET')
export const CR_DATABASE_URL = requireEnv('CR_DATABASE_URL')
export const GOOGLE_CLIENT_ID = requireEnv('GOOGLE_CLIENT_ID')
export const GOOGLE_CLIENT_SECRET = requireEnv('GOOGLE_CLIENT_SECRET')
