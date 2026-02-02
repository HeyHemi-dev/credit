import {
  createFileRoute,
  useNavigate,
  useRouter,
  useSearch,
} from '@tanstack/react-router'
import { RedirectToSignIn } from '@neondatabase/neon-js/auth/react'
import React from 'react'
import z from 'zod'
import { RouteError } from '@/components/route-error'
import { Skeleton } from '@/components/ui/skeleton'
import { Section } from '@/components/ui/section'
import { DeleteEvent } from '@/components/events/delete-event'
import { formatEmailList, formatInstagramCredits } from '@/lib/formatters'
import { useEvent } from '@/hooks/use-events'
import { CreditListItem } from '@/components/credit/credit-list'
import { useClipboard } from '@/hooks/use-clipboard'
import { formatDate, parseDrizzleDateStringToDate } from '@/lib/format-dates'
import { BackButton } from '@/components/back-button'
import { CopyButton } from '@/components/copy-button'
import { InputDiv } from '@/components/ui/input'
import { isSessionAuth, isShareAuth, useAuth } from '@/hooks/use-auth'
import { AUTH_STATUS } from '@/lib/constants'
import { AuthState } from '@/components/auth-state'
import {
  CreditProvider,
  useCreditContext,
} from '@/contexts/credit-page-context'
import { Separator } from '@/components/ui/separator'
import { ActionDrawer } from '@/components/action-drawer'
import { CreateCreditForm } from '@/components/credit/create-credit-form'
import { Button } from '@/components/ui/button'

const eventRouteSearchSchema = z.object({
  panel: z.boolean().optional(),
})

export const Route = createFileRoute('/(app)/_appLayout/events/$eventId')({
  ssr: false,
  component: RouteComponent,
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
  validateSearch: eventRouteSearchSchema,
})

function RouteComponent() {
  const { eventId } = Route.useParams()
  const authToken = useAuth()

  return (
    <>
      {authToken.status === AUTH_STATUS.UNAUTHENTICATED ||
        (isShareAuth(authToken) && <RedirectToSignIn />)}

      <Section>
        {isSessionAuth(authToken) ? (
          <CreditProvider authToken={authToken} eventId={eventId}>
            <React.Suspense fallback={<Skeleton />}>
              <EventDetailPage />
            </React.Suspense>
          </CreditProvider>
        ) : (
          <AuthState authToken={authToken} />
        )}
      </Section>
    </>
  )
}

function EventDetailPage() {
  const router = useRouter()
  const { eventId, authToken } = useCreditContext()
  const { getEventQuery } = useEvent(eventId, authToken)
  const event = getEventQuery.data

  const [isOpen, setIsOpen] = useDrawerState()
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const { isCopied: isCopiedInstagram, copy: copyInstagram } = useClipboard()
  const { isCopied: isCopiedEmail, copy: copyEmail } = useClipboard()
  const { isCopied: isCopiedShare, copy: copyShare } = useClipboard()

  const instagramText = React.useMemo(() => {
    return formatInstagramCredits(event.credits)
  }, [event.credits])

  const emailText = React.useMemo(() => {
    return formatEmailList(event.credits)
  }, [event.credits])

  const shareLink = React.useMemo(() => {
    return router
      .buildLocation({
        to: '/e/$eventId',
        params: { eventId: event.id },
        search: { shareToken: event.shareToken },
      })
      .url.toString()
  }, [event.id, event.shareToken])

  // TODO: edit event name and wedding date
  // TODO: add event locked checkbox (consider using eventStatus enum with open, submitted, and locked)
  // TODO: add ability to edit tags

  return (
    <>
      <div className="grid gap-6">
        <BackButton />

        <div className="flex flex-col">
          <h1 className="text-2xl font-light">{event.eventName}</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(parseDrizzleDateStringToDate(event.weddingDate))}
          </p>
        </div>
      </div>

      {/* Credit list */}
      <div className="grid gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-light">Suppliers</h2>
          <div className="flex flex-wrap gap-2">
            <CopyButton
              labels={{
                idle: 'Copy for Instagram',
                copied: 'Copied',
              }}
              isCopied={isCopiedInstagram}
              onClick={() => copyInstagram(instagramText)}
              disabled={!event.credits.length}
              className="grow"
            />
            <CopyButton
              variant="secondary"
              labels={{
                idle: 'Copy email list',
                copied: 'Copied',
              }}
              isCopied={isCopiedEmail}
              onClick={() => copyEmail(emailText)}
              disabled={!event.credits.length}
              className="grow"
            />
          </div>
        </div>
        {event.credits.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            <p>No suppliers yet.</p>
            <Button
              variant={'link'}
              className="justify-self-start p-0"
              onClick={() => setIsOpen(true)}
            >
              Add one now
            </Button>
          </div>
        ) : (
          <div className="grid gap-2">
            {event.credits.map((credit) => (
              <CreditListItem key={credit.id} credit={credit} />
            ))}
            <Button
              variant={'link'}
              className="justify-self-start p-0"
              onClick={() => setIsOpen(true)}
            >
              Add supplier
            </Button>
          </div>
        )}
      </div>

      {/* Share link */}
      <div className="grid gap-6">
        <div className="flex flex-col">
          <h2 className="text-lg font-light">Share</h2>
          <p className="text-sm text-muted-foreground">
            Copy the link below to share this event with your couple.
          </p>
        </div>
        <InputDiv className="flex h-auto flex-row items-center gap-2 py-0.5 pr-0.5">
          <span className="truncate text-sm text-muted-foreground">
            {shareLink}
          </span>
          <CopyButton
            variant={'default'}
            labels={{
              idle: 'Copy',
              copied: '',
            }}
            isCopied={isCopiedShare}
            onClick={() => copyShare(shareLink)}
          />
        </InputDiv>
      </div>

      <Separator className="mt-24" />
      <DeleteEvent />

      <ActionDrawer
        state={{ isOpen, setIsOpen }}
        content={{
          title: 'Tag a supplier',
          description:
            'Add one supplier at a time. Try searching first —if they’re not listed, you can create a new one.',
        }}
        setContainerRef={containerRef}
      >
        <CreateCreditForm
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
