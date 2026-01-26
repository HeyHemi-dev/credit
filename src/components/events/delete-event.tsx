import { useRouter } from '@tanstack/react-router'
import React from 'react'
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
import { useEvent } from '@/hooks/use-events'
import { useCreditContext } from '@/contexts/credit-page-context'

export function DeleteEvent() {
  const router = useRouter()
  const { eventId, authToken } = useCreditContext()
  const { deleteEventMutation } = useEvent(eventId, authToken)

  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)

  const handleDeleteEvent = () => {
    deleteEventMutation.mutate()
    router.navigate({ to: '/events' })
  }

  return (
    <>
      <div className="grid grow content-end gap-6">
        <h2 className="text-lg font-light text-destructive">Danger Zone</h2>
        <Button
          variant="destructive"
          onClick={() => setDeleteConfirmOpen(true)}
        >
          Delete event
        </Button>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-muted-foreground">
            This action deletes the event for you and your couple. Supplier
            profiles will not be deleted.
          </p>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel
              variant={'ghost'}
              disabled={deleteEventMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteEvent}
            >
              {deleteEventMutation.isPending ? 'Deleting…' : 'Delete event'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
