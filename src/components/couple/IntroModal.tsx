import * as React from 'react'
import { UI_TEXT } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const STORAGE_KEY = 'credit.coupleIntroDismissed.v1'

export function IntroModal() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem(STORAGE_KEY)
      if (!dismissed) setOpen(true)
    } catch {
      // ignore storage errors
      setOpen(true)
    }
  }, [])

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore
    }
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogTitle>{UI_TEXT.COUPLE_INTRO.TITLE}</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="text-sm text-muted-foreground">
          {UI_TEXT.COUPLE_INTRO.BODY}
        </div>

        <AlertDialogFooter className="grid grid-cols-2">
          <AlertDialogCancel variant="ghost" onClick={dismiss}>
            Close
          </AlertDialogCancel>
          <Button onClick={dismiss}>{UI_TEXT.COUPLE_INTRO.CTA}</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
