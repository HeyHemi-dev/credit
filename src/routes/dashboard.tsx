import { createFileRoute } from '@tanstack/react-router'
import React from 'react'
import { RedirectToSignIn } from '@neondatabase/neon-js/auth/react'
import { ActionDrawer } from '@/components/action-drawer'
import { CreateEventForm } from '@/components/events/create-event-form'

import { Section } from '@/components/ui/section'
import { isSessionAuthToken, useAuthToken } from '@/hooks/use-auth-token'
import { EventList, EventListSkeleton } from '@/components/events/event-list'
import { Button } from '@/components/ui/button'

import { AuthState } from '@/components/auth-state'
import { AUTH_STATUS } from '@/lib/constants'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const authToken = useAuthToken()
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  return (
    <>
      {authToken.status === AUTH_STATUS.UNAUTHENTICATED && <RedirectToSignIn />}

      <Section className="pb-24">
        {isSessionAuthToken(authToken) ? (
          <React.Suspense fallback={<EventListSkeleton />}>
            <EventList userId={authToken.authUserId} />
          </React.Suspense>
        ) : (
          <AuthState authToken={authToken} />
        )}
      </Section>

      <div className="fixed bottom-6 left-1/2 z-10 -translate-x-1/2">
        <Button
          className="h-auto border-2 border-primary/20 px-8 py-4 shadow-xl shadow-primary/20"
          onClick={() => setDrawerOpen(true)}
        >
          New event
        </Button>
      </div>

      <ActionDrawer
        state={{ isOpen: drawerOpen, setIsOpen: setDrawerOpen }}
        content={{ title: 'Create Event' }}
        setContainerRef={containerRef}
      >
        <CreateEventForm
          onSubmit={() => setDrawerOpen(false)}
          onCancel={() => setDrawerOpen(false)}
          containerRef={containerRef}
        />
      </ActionDrawer>
    </>
  )
}
