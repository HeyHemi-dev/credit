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
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/17037db5-3e4a-43c3-8a86-d6aac6646a48',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run_create_event',hypothesisId:'CE1',location:'src/components/events/CreateEventDrawer.tsx:createMutation',message:'createEvent mutationFn called',data:{eventNameLen:eventName.trim().length,weddingDate,regionValue:region||'(empty)'},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      try {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/17037db5-3e4a-43c3-8a86-d6aac6646a48',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run_create_event',hypothesisId:'CE1b',location:'src/components/events/CreateEventDrawer.tsx:createMutation',message:'about to call createEvent (useServerFn)',data:{createEventType:typeof createEvent},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/17037db5-3e4a-43c3-8a86-d6aac6646a48',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run_create_event',hypothesisId:'CE1f',location:'src/components/events/CreateEventDrawer.tsx:createMutation',message:'about to call createEventFn directly',data:{createEventFnType:typeof createEventFn},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        // In this codebase, serverFns are called directly (see couple routes).
        const ev = await createEventFn({
          data: {
            eventName,
            weddingDate,
            region,
          },
        } as any)

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/17037db5-3e4a-43c3-8a86-d6aac6646a48',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run_create_event',hypothesisId:'CE1c',location:'src/components/events/CreateEventDrawer.tsx:createMutation',message:'createEvent returned',data:{isUndefined:ev===undefined,evType:typeof ev,keys:(ev&&typeof ev==='object')?Object.keys(ev as any).slice(0,8):[]},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        return ev as any
      } catch (err) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/17037db5-3e4a-43c3-8a86-d6aac6646a48',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run_create_event',hypothesisId:'CE1e',location:'src/components/events/CreateEventDrawer.tsx:createMutation',message:'createEvent threw',data:{name:(err as any)?.name,message:(err as any)?.message},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        throw err
      }
    },
    onSuccess: async (ev) => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/17037db5-3e4a-43c3-8a86-d6aac6646a48',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run_create_event',hypothesisId:'CE2',location:'src/components/events/CreateEventDrawer.tsx:onSuccess',message:'createEvent success',data:{isUndefined:ev===undefined,evType:typeof ev,keys:(ev&&typeof ev==='object')?Object.keys(ev as any).slice(0,8):[],hasId:!!(ev as any)?.id},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setCreated(ev)
      await queryClient.invalidateQueries({ queryKey: ['events'] })
    },
    onError: (err) => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/17037db5-3e4a-43c3-8a86-d6aac6646a48',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run_create_event',hypothesisId:'CE3',location:'src/components/events/CreateEventDrawer.tsx:onError',message:'createEvent error',data:{name:(err as any)?.name,message:(err as any)?.message},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
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
              // #region agent log
              fetch('http://127.0.0.1:7243/ingest/17037db5-3e4a-43c3-8a86-d6aac6646a48',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run_create_event',hypothesisId:'CE0',location:'src/components/events/CreateEventDrawer.tsx:onSubmit',message:'createEvent form submitted',data:{eventNameLen:eventName.trim().length,weddingDate,regionValue:region||'(empty)'},timestamp:Date.now()})}).catch(()=>{});
              // #endregion
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

