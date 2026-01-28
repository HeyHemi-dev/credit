import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import React from 'react'
import { RedirectToSignIn } from '@neondatabase/neon-js/auth/react'
import z from 'zod'
import { ActionDrawer } from '@/components/action-drawer'
import { CreateEventForm } from '@/components/events/create-event-form'

import { Section } from '@/components/ui/section'
import { isSessionAuthToken, useAuthToken } from '@/hooks/use-auth-token'
import { EventList, EventListSkeleton } from '@/components/events/event-list'
import { Button } from '@/components/ui/button'

import { AuthState } from '@/components/auth-state'
import { AUTH_STATUS } from '@/lib/constants'

const eventsRouteSearchSchema = z.object({
  panel: z.boolean().optional(),
})

export const Route = createFileRoute('/events/')({
  component: RouteComponent,
  validateSearch: eventsRouteSearchSchema,
})

function RouteComponent() {
  const authToken = useAuthToken()
  const [isOpen, setIsOpen] = useDrawerState()
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  return (
    <>
      {authToken.status === AUTH_STATUS.UNAUTHENTICATED && <RedirectToSignIn />}

      <Section className="pb-24">
        {isSessionAuthToken(authToken) ? (
          <React.Suspense fallback={<EventListSkeleton />}>
            <EventList authToken={authToken} />
          </React.Suspense>
        ) : (
          <AuthState authToken={authToken} />
        )}
      </Section>

      <div className="fixed bottom-6 left-1/2 z-10 -translate-x-1/2">
        <Button
          className="h-auto bg-linear-to-br from-teal-400 to-primary px-8 py-4 shadow-xl shadow-primary/20"
          onClick={() => setIsOpen(true)}
        >
          New event
        </Button>
      </div>

      <ActionDrawer
        state={{ isOpen, setIsOpen }}
        content={{ title: 'Create Event' }}
        setContainerRef={containerRef}
      >
        <CreateEventForm
          onSubmit={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
          containerRef={containerRef}
        />
      </ActionDrawer>
    </>
  )
}

// Use a locally scoped hook because tanstack requires Route.id to return search params.
export function useDrawerState() {
  const navigate = useNavigate()
  const search = useSearch({ from: Route.id })

  const isOpen = search.panel ?? false

  const setIsOpen = React.useCallback(
    (open: boolean) => {
      navigate({
        to: '.',
        replace: true,
        search: (prev) => ({
          ...prev,
          panel: open ? true : undefined,
        }),
      })
    },
    [navigate],
  )

  return [isOpen, setIsOpen] as const
}
