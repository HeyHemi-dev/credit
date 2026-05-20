import { config } from 'dotenv'
import { z } from 'zod'
import { ERROR } from '@/lib/errors'

// Load from .env.local for local development
// Vercel automatically sets env vars for preview/production
if (!process.env.VERCEL) {
  config({ path: '.env.local' })
}

const envValueSchema = z.string().min(1)

export function requireEnv(key: string): string {
  const { data, error } = envValueSchema.safeParse(process.env[key])
  if (error) throw ERROR.INVALID_STATE(`${key} is not set`)
  return data
}

export const AUTH_SECRET = requireEnv('AUTH_SECRET')
export const CR_DATABASE_URL = requireEnv('CR_DATABASE_URL')
export const EMAIL_FROM = requireEnv('EMAIL_FROM')
export const GOOGLE_CLIENT_ID = requireEnv('GOOGLE_CLIENT_ID')
export const GOOGLE_CLIENT_SECRET = requireEnv('GOOGLE_CLIENT_SECRET')
export const RESEND_API_KEY = requireEnv('RESEND_API_KEY')
