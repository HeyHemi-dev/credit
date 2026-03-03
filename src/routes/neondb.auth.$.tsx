import { createFileRoute } from '@tanstack/react-router'
import { proxyNeonAuthRequest } from '@/lib/server/neon-auth'

export const Route = createFileRoute('/neondb/auth/$')({
  server: {
    handlers: {
      ANY: ({ request }) => proxyNeonAuthRequest(request),
    },
  },
})
