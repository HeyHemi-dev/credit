import { isDev, isServer } from '@/lib/utils'

type LogPayload = Record<string, unknown>

export const logger = {
  info(event: string, payload?: LogPayload): void {
    if (!isServer && !isDev) return // Don't log on client, unless in development
    console.info(`[${event}]`, payload ?? {})
  },
  error(event: string, payload?: LogPayload): void {
    if (!isServer && !isDev) return // Don't log on client, unless in development
    console.error(`[${event}]`, payload ?? {})
  },
}
