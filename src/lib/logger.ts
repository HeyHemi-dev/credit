import { isClient, isDev } from '@/lib/utils'

type LogPayload = Record<string, unknown>

export const logger = {
  info(event: string, payload?: LogPayload): void {
    if (isClient && !isDev) return // Don't log on the client in production
    console.info(`[${event}]`, payload ?? {})
  },
  error(event: string, payload?: LogPayload): void {
    if (isClient && !isDev) return // Don't log on the client in production
    console.error(`[${event}]`, payload ?? {})
  },
}
