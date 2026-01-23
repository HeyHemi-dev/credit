import * as React from 'react'
import { useRouterState } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { isDev, sleep } from '@/lib/utils'
import { logger } from '@/lib/logger'
import { Main, Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'

// Per-tab/session (resets on full reload)
const retryCounts = new Map<string, number>()

function incrementRetry(pathname: string) {
  const next = (retryCounts.get(pathname) ?? 0) + 1
  retryCounts.set(pathname, next)
  return next
}

export function RouteError({ error, info, reset }: ErrorComponentProps) {
  const [isRetrying, setIsRetrying] = React.useState(false)
  const { location } = useRouterState()

  const logContext = React.useMemo(
    () => ({
      url: `${location.pathname}${location.search}${location.hash}`,
      path: location.pathname,
    }),
    [location.pathname, location.search, location.hash],
  )

  // Log the error once per error boundary instance
  React.useEffect(() => {
    logger.error(`routeError.${location.pathname}`, {
      ...logContext,
      error,
      info,
    })
  }, [error, info, location.pathname])

  const onRetry = async () => {
    if (isRetrying) return
    setIsRetrying(true)

    const retryCount = incrementRetry(location.pathname)
    logger.info(`routeError.${location.pathname}.retry`, {
      ...logContext,
      retryCount,
    })

    // micro delay so loading feedback is visible
    await sleep(100)

    // This will typically remount the route; no need to setIsRetrying(false)
    reset()
  }

  return (
    <Section>
      <div className="grid gap-2">
        <h1 className="text-4xl font-light">Something went wrong</h1>
        <p className="text-muted-foreground">{error.message}</p>
      </div>

      <Button variant="secondary" onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? 'Retrying…' : 'Try again'}
      </Button>

      {/* Dev-only detail (optional) */}
      {isDev && info?.componentStack ? (
        <pre className="mt-4 max-h-40 overflow-auto rounded-md border p-3 text-xs text-muted-foreground">
          {info.componentStack}
        </pre>
      ) : null}
    </Section>
  )
}
