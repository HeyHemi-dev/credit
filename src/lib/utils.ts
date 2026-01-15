import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export const isServer = typeof window === 'undefined'
export const isDev = process.env.VERCEL_ENV === 'development'

export function generateToken(length: number) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (x) => chars[x % chars.length]).join('')
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
