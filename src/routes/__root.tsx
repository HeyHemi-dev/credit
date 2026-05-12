/// <reference types="vite/client" />

import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import appCss from '@/styles.css?url'

import { RouteError } from '@/components/route-error'
import { RouteNotFound } from '@/components/route-not-found'
import { DevTools } from '@/components/devtools'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'With Thanks' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
  notFoundComponent: () => <RouteNotFound />,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
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
  )
}
