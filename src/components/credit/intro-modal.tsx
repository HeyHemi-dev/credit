import React from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { tryCatchSync } from '@/lib/try-catch'
import { Brand } from '@/components/header'
import { shareIntroModalDismissed } from '@/lib/local-storage'
import { useCreditContext } from '@/contexts/credit-page-context'

export function IntroModal() {
  // TODO: add notice about agreeing to the terms of service and privacy policy (By using this link, you agree to our [Terms] and [Privacy Policy]")

  const { eventId } = useCreditContext()
  const [open, setOpen] = React.useState(false)
  const { getValue, setValue } = shareIntroModalDismissed(eventId)

  React.useEffect(() => {
    const { data: dismissed } = tryCatchSync(getValue)
    if (dismissed) return
    setOpen(true)
  }, [])

  function dismiss() {
    tryCatchSync(() => setValue('1'))
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader className="grid place-items-start gap-y-8">
          <Brand />
          <div className="grid gap-4">
            <AlertDialogTitle>Help us thank your suppliers</AlertDialogTitle>
            <div className="grid gap-4 text-sm text-pretty text-muted-foreground">
              <p>
                Add the suppliers you worked with so everyone can be tagged
                properly. It helps small businesses get seen —and it only takes
                a minute.
              </p>
              <p>No login needed. We’ll save as you go.</p>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction onClick={dismiss} className="min-w-24">
            Got it
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
