import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'
import type { AuthToken } from '@/lib/types/validation-schema'
import { AUTH_STATUS, AUTH_TOKEN_TYPE } from '@/lib/constants'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const isServer = typeof window === 'undefined'
export const isDev = import.meta.env.DEV

export function generateToken(length: number) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (x) => chars[x % chars.length]).join('')
}

export function resolveAuthToken(input: {
  isPending: boolean
  sessionToken?: string | null
  shareToken?: string | null
}): AuthToken {
  if (input.isPending) {
    return { status: AUTH_STATUS.PENDING }
  }

  if (input.sessionToken) {
    return {
      status: AUTH_STATUS.AUTHENTICATED,
      tokenType: AUTH_TOKEN_TYPE.SESSION_TOKEN,
      token: input.sessionToken,
    }
  }

  if (input.shareToken) {
    return {
      status: AUTH_STATUS.AUTHENTICATED,
      tokenType: AUTH_TOKEN_TYPE.SHARE_TOKEN,
      token: input.shareToken,
    }
  }

  return { status: AUTH_STATUS.UNAUTHENTICATED }
}
