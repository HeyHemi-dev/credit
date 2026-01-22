import { createFileRoute } from '@tanstack/react-router'
import { RedirectToSignIn } from '@neondatabase/neon-js/auth/react'
import React from 'react'
import { RouteError } from '@/components/route-error'
import { authClient } from '@/auth'
import { Skeleton } from '@/components/ui/skeleton'
import { Main, Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatEmailList, formatInstagramCredits } from '@/lib/formatters'
import { useEvent } from '@/hooks/use-events'
import { CreditListItem } from '@/components/credit/credit-list'
import { useClipboard } from '@/hooks/use-clipboard'
import { formatDate, parseDrizzleDateStringToDate } from '@/lib/format-dates'
import { BackButton } from '@/components/back-button'
import { CopyButton } from '@/components/copy-button'

export const Route = createFileRoute('/events/$eventId')({
  component: RouteComponent,
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
})

function RouteComponent() {
  const { data, isPending } = authClient.useSession()
  const { eventId } = Route.useParams()

  if (isPending) {
    return <Skeleton />
  }

  if (!data) {
    return <RedirectToSignIn />
  }

  return (
    <React.Suspense fallback={<Skeleton />}>
      <EventDetailContent eventId={eventId} authUserId={data.session.userId} />
    </React.Suspense>
  )
}

function EventDetailContent({
  eventId,
  authUserId,
}: {
  eventId: string
  authUserId: string
}) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const { isCopied: isCopiedInstagram, copy: copyInstagram } = useClipboard()
  const { isCopied: isCopiedEmail, copy: copyEmail } = useClipboard()
  const { getEventQuery, deleteEventMutation } = useEvent(eventId, authUserId)
  const event = getEventQuery.data

  const instagramText = React.useMemo(() => {
    return formatInstagramCredits(event.credits)
  }, [event.credits])

  const emailText = React.useMemo(() => {
    return formatEmailList(event.credits)
  }, [event.credits])

  return (
    <>
      <Section>
        <BackButton />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-light">{event.eventName}</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(parseDrizzleDateStringToDate(event.weddingDate))}
          </p>
        </div>
        <div className="grid gap-6">
          <div className="flex flex-col gap-4">
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
              />
            </div>
          </div>

          {event.credits.length === 0 ? (
            <div className="text-sm text-muted-foreground">None yet.</div>
          ) : (
            <div className="grid gap-4">
              {event.credits.map((row) => (
                <CreditListItem
                  key={row.id}
                  credit={row}
                  eventId={eventId}
                  shareToken={event.shareToken}
                />
              ))}
            </div>
          )}
        </div>
      </Section>
      <Section className="grow-0 gap-6">
        <h2 className="text-lg font-light text-destructive">Danger zone</h2>
        <Button
          variant="destructive"
          onClick={() => setDeleteConfirmOpen(true)}
        >
          Delete event
        </Button>
      </Section>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="text-sm text-muted-foreground">
            This deletes the event and its supplier links. Suppliers are not
            deleted.
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteEventMutation.mutate()}
            >
              {deleteEventMutation.isPending ? 'Deleting…' : 'Delete event'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
