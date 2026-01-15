/// <reference types="vite/client" />

import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react'
import { authClient } from '@/auth'

import appCss from '@/styles.css?url'
import { Header } from '@/components/header'
import { RouteError } from '@/components/ui/route-error'

export const Route = createRootRoute({
  ssr: false,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Give Credit' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <html lang="en">
        <head>
          <HeadContent />
        </head>

        <body className="grid bg-muted text-foreground grid-cols-[auto_minmax(0,32rem)_auto]">
          <div className="col-start-2 col-end-2 grid grid-rows-[auto_1fr_auto] min-h-screen bg-muted p-1">
            <header className="py-4">
              <Header />
            </header>

            {children}

            <footer></footer>
          </div>
          <TanStackDevtools
            config={{ position: 'bottom-right' }}
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
    </Providers>
  )
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NeonAuthUIProvider
      authClient={authClient}
      social={{ providers: ['google'] }}
      credentials={false}
    >
      {children}
    </NeonAuthUIProvider>
  )
}
