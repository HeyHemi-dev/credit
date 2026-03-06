import { createFileRoute } from '@tanstack/react-router'
import { getServerSession } from '@/lib/server/better-auth'

export const Route = createFileRoute('/api/session')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await getServerSession(request)

        if (!session) {
          return Response.json({ authenticated: false }, { status: 401 })
        }

        return Response.json({
          authenticated: true,
          user: {
            id: session.user?.id ?? null,
            email: session.user?.email ?? null,
          },
          session: {
            id: session.session?.id ?? null,
            userId: session.session?.userId ?? null,
          },
        })
      },
    },
  },
})
