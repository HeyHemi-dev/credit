import { createFileRoute, useRouter } from '@tanstack/react-router'
import { RedirectToSignIn } from '@neondatabase/neon-js/auth/react'
import React from 'react'
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
import {
  isSessionAuthToken,
  isShareAuthToken,
  useAuthToken,
} from '@/hooks/use-auth-token'
import { AUTH_STATUS } from '@/lib/constants'
import { AuthState } from '@/components/auth-state'
import {
  CreditProvider,
  useCreditContext,
} from '@/contexts/credit-page-context'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/events/$eventId')({
  ssr: false,
  component: RouteComponent,
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
})

function RouteComponent() {
  // TODO: implement auth token check that doesn't remount the component

  const { eventId } = Route.useParams()
  const authToken = useAuthToken()

  return (
    <>
      {authToken.status === AUTH_STATUS.UNAUTHENTICATED ||
        (isShareAuthToken(authToken) && <RedirectToSignIn />)}

      <Section>
        {isSessionAuthToken(authToken) ? (
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

  return (
    <>
      <BackButton />

      <div className="flex flex-col">
        <h1 className="text-2xl font-light">{event.eventName}</h1>
        <p className="text-sm text-muted-foreground">
          {formatDate(parseDrizzleDateStringToDate(event.weddingDate))}
        </p>
      </div>

      {/* Credit list */}
      <div className="grid gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-light">Supplier List</h2>
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
          </div>
        ) : (
          <div className="grid gap-4">
            {event.credits.map((credit) => (
              <CreditListItem key={credit.id} credit={credit} />
            ))}
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
    </>
  )
}
