import * as React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteEventFn, getEventFn } from '@/lib/server/events'
import { getEventSuppliersFn } from '@/lib/server/event-suppliers'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

type EventRow = Awaited<ReturnType<typeof getEventFn>>

export function EventDetailDrawer({
  open,
  onOpenChange,
  eventId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string | null
}) {
  const queryClient = useQueryClient()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)

  const eventQuery = useQuery({
    enabled: open && !!eventId,
    queryKey: ['event', eventId],
    queryFn: async () => await getEventFn({ data: { eventId: eventId! } }),
  })

  const suppliersQuery = useQuery({
    enabled: open && !!eventId,
    queryKey: ['eventSuppliers', eventId],
    queryFn: async () =>
      await getEventSuppliersFn({ data: { eventId: eventId! } }),
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!eventId) return
      await deleteEventFn({ data: { eventId } })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
      onOpenChange(false)
    },
  })

  const event = eventQuery.data
  const rows = suppliersQuery.data?.rows ?? []

  const instagramText = React.useMemo(() => {
    return formatInstagramCredits(
      rows.map((r) => ({
        name: r.supplier.name,
        email: r.supplier.email,
        instagramHandle: r.supplier.instagramHandle ?? null,
        service: r.service,
      })),
    )
  }, [rows])

  const emailText = React.useMemo(() => {
    return formatEmailList(rows.map((r) => ({ email: r.supplier.email })))
  }, [rows])

  const copy = async (text: string) => {
    if (typeof window === 'undefined') return
    await navigator.clipboard.writeText(text)
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="fixed left-1/2 bottom-0 top-auto -translate-x-1/2 translate-y-0 w-full max-w-lg rounded-t-4xl rounded-b-none max-h-[92vh] overflow-y-auto">
          <AlertDialogHeader className="place-items-start text-left">
            <AlertDialogTitle>{event?.eventName ?? 'Event'}</AlertDialogTitle>
          </AlertDialogHeader>

          {eventQuery.isLoading || suppliersQuery.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : eventQuery.isError || suppliersQuery.isError ? (
            <div className="text-sm text-destructive">Couldn’t load event.</div>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <div className="flex gap-2">
                  <Button
                    onClick={() => copy(instagramText)}
                    disabled={!rows.length}
                  >
                    Copy for Instagram
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copy(emailText)}
                    disabled={!rows.length}
                  >
                    Copy email list
                  </Button>
                </div>
                <Card size="sm">
                  <CardContent className="whitespace-pre-wrap wrap-break-word text-sm">
                    {instagramText || 'No suppliers yet.'}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-medium">Suppliers</div>
                {rows.length === 0 ? (
                  <div className="text-sm text-muted-foreground">None yet.</div>
                ) : (
                  <div className="grid gap-2">
                    {rows.map((r) => (
                      <Card key={`${r.eventId}:${r.supplierId}`} size="sm">
                        <CardContent className="grid gap-1">
                          <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
                            <div className="grid gap-1">
                              <div className="font-medium">
                                {r.supplier.name}
                              </div>
                              <div className="text-muted-foreground text-sm">
                                {r.service}
                                {r.supplier.instagramHandle
                                  ? ` • @${r.supplier.instagramHandle}`
                                  : ' • Missing IG'}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-2 pt-2 border-t">
                <div className="text-sm font-medium text-destructive">
                  Danger zone
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  Delete event…
                </Button>
              </div>
            </div>
          )}

          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel variant="ghost">Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete event'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
