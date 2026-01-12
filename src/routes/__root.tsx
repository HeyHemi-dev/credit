import {
  HeadContent,
  Scripts,
  createRootRoute,
  redirect,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react'
import { authClient } from '../auth'

import appCss from '../styles.css?url'
import { Header } from '@/components/header'
import { SHARE_LINK } from '@/lib/constants'
import { getCurrentUserFn } from '@/lib/server/auth'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  beforeLoad: async ({ location }) => {
    // Public couple flow is accessible via private link (share token).
    if (location.pathname.startsWith(SHARE_LINK.PATH_PREFIX)) return
    // Auth routes must remain public.
    if (location.pathname.startsWith('/auth')) return

    try {
      await getCurrentUserFn()
    } catch {
      throw redirect({
        to: '/auth/sign-in',
        search: { redirect: location.href },
      })
    }
  },

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isCoupleView = pathname.startsWith(SHARE_LINK.PATH_PREFIX)

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      social={{ providers: ['google'] }}
      credentials={false}
    >
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body className="grid bg-muted text-foreground grid-cols-[auto_minmax(0,32rem)_auto]">
          <div className="col-start-2 col-end-2 grid grid-rows-[auto_1fr_auto] min-h-screen shadow-2xl bg-background">
            {isCoupleView ? null : (
              <header className="py-2 border-b">
                <Header />
              </header>
            )}
            <main className="flex flex-col overflow-x-clip gap-4">
              {children}
            </main>
            <footer></footer>
          </div>
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
          <Scripts />
        </body>
      </html>
    </NeonAuthUIProvider>
  )
}
