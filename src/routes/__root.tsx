/// <reference types="vite/client" />

import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react'
import { authClient } from '@/auth'

import appCss from '@/styles.css?url'
import { Header } from '@/components/header'
import { RouteError } from '@/components/route-error'
import { Main } from '@/components/ui/section'
import { isDev } from '@/lib/utils'

// TODO: Rename project to "With Thanks"
// TODO: create notFound component `notFoundComponent:`

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
    <NeonAuthUIProvider
      authClient={authClient}
      social={{ providers: ['google'] }}
      credentials={false}
    >
      <html lang="en">
        <head>
          <HeadContent />
        </head>

        <body className="grid grid-cols-[auto_minmax(0,32rem)_auto] bg-muted text-foreground">
          <div className="col-start-2 col-end-2 grid min-h-screen grid-rows-[auto_1fr_auto] bg-muted p-1">
            <header className="py-4">
              <Header />
            </header>
            <Main>{children}</Main>
            <footer></footer>
          </div>
          <DevTools />
          <Scripts />
        </body>
      </html>
    </NeonAuthUIProvider>
  )
}

function DevTools() {
  if (!isDev) return null

  return (
    <TanStackDevtools
      config={{ position: 'bottom-right' }}
      plugins={[
        {
          name: 'Tanstack Router',
          render: <TanStackRouterDevtoolsPanel />,
        },
      ]}
    />
  )
}
