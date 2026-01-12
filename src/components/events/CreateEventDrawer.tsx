import * as React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createEventFn } from '@/lib/server/events'
import { REGION_KEYS, REGION, SHARE_LINK } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type CreatedEvent = Awaited<ReturnType<typeof createEventFn>>

export function CreateEventDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [created, setCreated] = React.useState<CreatedEvent | null>(null)

  const [eventName, setEventName] = React.useState('')
  const [weddingDate, setWeddingDate] = React.useState('')
  const [region, setRegion] = React.useState<string>('')

  const createMutation = useMutation({
    mutationFn: async () => {
      return await createEventFn({
        data: {
          eventName,
          weddingDate,
          region,
        },
      })
    },
    onSuccess: async (ev) => {
      setCreated(ev)
      await queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  const reset = React.useCallback(() => {
    setCreated(null)
    setEventName('')
    setWeddingDate('')
    setRegion('')
    createMutation.reset()
  }, [createMutation])

  const onClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) reset()
  }

  const copyLink = async () => {
    if (!created || typeof window === 'undefined') return
    const url = `${window.location.origin}${SHARE_LINK.PATH_PREFIX}/${created.shareToken}`
    await navigator.clipboard.writeText(url)
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent
        className="fixed left-1/2 bottom-0 top-auto -translate-x-1/2 translate-y-0 w-full max-w-lg rounded-t-4xl rounded-b-none"
      >
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogTitle>
            {created ? 'Private link ready' : 'Create new event'}
          </AlertDialogTitle>
        </AlertDialogHeader>

        {created ? (
          <div className="grid gap-3">
            <div className="text-muted-foreground text-sm">
              Copy this private link and send it to your couple.
            </div>
            <div className="rounded-2xl border bg-muted/30 px-3 py-2 text-sm break-all">
              {typeof window === 'undefined'
                ? `${SHARE_LINK.PATH_PREFIX}/${created.shareToken}`
                : `${window.location.origin}${SHARE_LINK.PATH_PREFIX}/${created.shareToken}`}
            </div>
            <Button onClick={copyLink}>Copy link</Button>
          </div>
        ) : (
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              createMutation.mutate()
            }}
          >
            <div className="grid gap-1">
              <div className="text-sm font-medium">Couple name</div>
              <Input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Sam & Alex"
              />
            </div>

            <div className="grid gap-1">
              <div className="text-sm font-medium">Wedding date</div>
              <Input
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
              />
            </div>

            <div className="grid gap-1">
              <div className="text-sm font-medium">Region (optional)</div>
              <Select value={region} onValueChange={(v) => setRegion(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {REGION_KEYS.map((key) => (
                    <SelectItem key={key} value={REGION[key]}>
                      {REGION[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {createMutation.isError ? (
              <div className="text-sm text-destructive">
                Couldn’t create event. Please try again.
              </div>
            ) : null}

            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create event'}
            </Button>
          </form>
        )}

        <AlertDialogFooter className="pt-2">
          <AlertDialogCancel variant="ghost">Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

