import { ERROR } from '@/lib/errors'

export function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw ERROR.INVALID_STATE(`${key} is not set`)
  }
  return value
}
