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
        <AlertDialogHeader className="grid place-items-start gap-4 text-left">
          <AlertDialogTitle>Help us credit your suppliers</AlertDialogTitle>
          <div className="grid gap-4 text-sm text-pretty text-muted-foreground">
            <p>
              List the suppliers you used for your wedding, so they can easily
              credit each other on social media.
            </p>
            <p>No login required. We'll auto-save as you go.</p>
          </div>
        </AlertDialogHeader>

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
