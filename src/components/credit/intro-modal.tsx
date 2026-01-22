import * as React from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { tryCatchSync } from '@/lib/try-catch'

const STORAGE_KEY = 'credit.coupleIntroDismissed.v1'

export function IntroModal() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const { data: dismissed } = tryCatchSync(() =>
      window.localStorage.getItem(STORAGE_KEY),
    )
    if (dismissed) return
    setOpen(true)
  }, [])

  function dismiss() {
    tryCatchSync(() => window.localStorage.setItem(STORAGE_KEY, '1'))
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogTitle>Help us credit your suppliers</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="grid gap-4 text-sm text-pretty text-muted-foreground">
          <p>
            Give Credit lets you list the suppliers you used for your wedding.
          </p>
          <p>
            Share the list with your photographer so they can credit and thank
            them properly.
          </p>
          <p>No login needed. We'll auto-save as you go.</p>
        </div>

        <AlertDialogFooter className="flex justify-end">
          <AlertDialogCancel
            variant="default"
            onClick={dismiss}
            className="min-w-24"
          >
            Got it
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
