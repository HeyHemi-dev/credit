import {  clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type {ClassValue} from 'clsx';

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export const isServer = typeof window === 'undefined'
export const isDev = process.env.VERCEL_ENV === 'development'
