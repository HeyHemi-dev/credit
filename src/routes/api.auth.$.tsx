import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/lib/server/better-auth'
import { AUTH_API_BASE_PATH } from '@/lib/auth-constants'
import { logger } from '@/lib/logger'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return handleAuthRequest(request)
      },
      POST: async ({ request }) => {
        return handleAuthRequest(request)
      },
    },
  },
})

async function handleAuthRequest(request: Request) {
        const startedAt = Date.now()
        const { pathname } = new URL(request.url)

        try {
          const response = await auth.handler(request)
          const durationMs = Date.now() - startedAt

          const shouldLogInfo =
            pathname.startsWith(`${AUTH_API_BASE_PATH}/sign-in`) ||
            pathname.startsWith(`${AUTH_API_BASE_PATH}/callback`) ||
            pathname.startsWith(`${AUTH_API_BASE_PATH}/sign-out`) ||
            response.status >= 300

          if (shouldLogInfo) {
            logger.info(`auth.route ${request.method} ${pathname} ${response.status}`)
          }

          if (!response.ok) {
            logger.error('auth.route.non_ok', {
              method: request.method,
              path: pathname,
              status: response.status,
              durationMs,
            })
          }

          return response
        } catch (error) {
          logger.error('auth.route.error', {
            method: request.method,
            path: pathname,
            durationMs: Date.now() - startedAt,
            error: error instanceof Error ? error.message : String(error),
          })
          throw error
        }
}
