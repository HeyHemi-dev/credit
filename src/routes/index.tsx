import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import * as React from 'react'
import { RedirectToSignIn, SignedIn, SignedOut } from '@neondatabase/neon-js/auth/react/ui'

import { Section } from '@/components/ui/section'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SHARE_LINK, UI_TEXT } from '@/lib/constants'
import { listEventsFn } from '@/lib/server/events'
import { CreateEventDrawer } from '@/components/events/CreateEventDrawer'
import { EventDetailDrawer } from '@/components/events/EventDetailDrawer'
import { authClient } from '@/auth'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { data: sessionData } = authClient.useSession()
  const isSignedIn = !!sessionData?.session

  const [createOpen, setCreateOpen] = React.useState(false)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(
    null,
  )
  const eventsQuery = useQuery({
    enabled: isSignedIn,
    queryKey: ['events'],
    queryFn: async () => await listEventsFn(),
  })

  const events = eventsQuery.data ?? []

  const copyLink = async (shareToken: string) => {
    if (typeof window === 'undefined') return
    const url = `${window.location.origin}${SHARE_LINK.PATH_PREFIX}/${shareToken}`
    await navigator.clipboard.writeText(url)
  }

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <Section className="pb-20">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Events</h1>
      </div>

      {eventsQuery.isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading…</CardTitle>
          </CardHeader>
        </Card>
      ) : eventsQuery.isError ? (
        <Card>
          <CardHeader>
            <CardTitle>Couldn’t load events</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => eventsQuery.refetch()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            {UI_TEXT.EMPTY_STATES.EVENTS}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {events.map((ev) => (
            <Card key={ev.id} size="sm">
              <CardContent
                className="grid gap-2 cursor-pointer"
                onClick={() => {
                  setSelectedEventId(ev.id)
                  setDetailOpen(true)
                }}
              >
                <div className="grid grid-cols-[1fr_auto] items-start gap-3">
                  <div className="grid gap-1">
                    <div className="font-medium">{ev.eventName}</div>
                    <div className="text-muted-foreground text-sm">
                      {ev.weddingDate}
                      {ev.region ? ` • ${ev.region}` : null}
                      {typeof ev.supplierCount === 'number'
                        ? ` • ${ev.supplierCount} suppliers`
                        : null}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      void copyLink(ev.shareToken)
                    }}
                  >
                    Copy link
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 w-[min(32rem,100vw)] px-4">
        <Button className="w-full" onClick={() => setCreateOpen(true)}>
          New event
        </Button>
      </div>

      <CreateEventDrawer open={createOpen} onOpenChange={setCreateOpen} />
      <EventDetailDrawer
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open)
          if (!open) setSelectedEventId(null)
        }}
        eventId={selectedEventId}
      />
        </Section>
      </SignedIn>
    </>
  )
}
