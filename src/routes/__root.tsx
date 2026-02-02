/// <reference types="vite/client" />

import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react'
import { authClient } from '@/auth'

import appCss from '@/styles.css?url'

import { RouteError } from '@/components/route-error'
import { isDev } from '@/lib/utils'
import { RouteNotFound } from '@/components/route-not-found'

// TODO: Rename project to "With Thanks"

export const Route = createRootRoute({
  ssr: false,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'With Thanks' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
  notFoundComponent: () => <RouteNotFound />,
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

        <body className="min-h-screen bg-muted">
          {children}
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
