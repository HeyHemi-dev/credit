// import * as React from 'react'
// import { Cancel01Icon } from '@hugeicons/core-free-icons'
// import { HugeiconsIcon } from '@hugeicons/react'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent } from '@/components/ui/card'
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog'
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
// } from '@/components/ui/drawer'
// import { formatEmailList, formatInstagramCredits } from '@/lib/formatters'
// import { useEvent } from '@/hooks/use-events'

// export function EventDetailContent({
//   eventId,
//   authUserId,
// }: {
//   eventId: string
//   authUserId: string
// }) {
//   const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
//   const { eventQuery, deleteMutation } = useEvent(eventId, authUserId)
//   const event = eventQuery.data
//   const rows = event.suppliers

//   const instagramText = React.useMemo(() => {
//     return formatInstagramCredits(
//       rows.map((r) => ({
//         name: r.name,
//         email: r.email,
//         instagramHandle: r.instagramHandle ?? null,
//         service: r.service,
//       })),
//     )
//   }, [rows])

//   const emailText = React.useMemo(() => {
//     return formatEmailList(rows.map((r) => ({ email: r.email })))
//   }, [rows])

//   const copy = async (text: string) => {
//     if (typeof window === 'undefined') return
//     await navigator.clipboard.writeText(text)
//   }

//   return (
//     <>
//       <div className="grid gap-4">
//         <div className="text-base font-medium">{event.eventName}</div>
//         <div className="grid gap-2">
//           <div className="flex gap-2">
//             <Button onClick={() => copy(instagramText)} disabled={!rows.length}>
//               Copy for Instagram
//             </Button>
//             <Button
//               variant="outline"
//               onClick={() => copy(emailText)}
//               disabled={!rows.length}
//             >
//               Copy email list
//             </Button>
//           </div>
//           <Card size="sm">
//             <CardContent className="text-sm wrap-break-word whitespace-pre-wrap">
//               {instagramText || 'No suppliers yet.'}
//             </CardContent>
//           </Card>
//         </div>

//         <div className="grid gap-2">
//           <div className="text-sm font-medium">Suppliers</div>
//           {rows.length === 0 ? (
//             <div className="text-sm text-muted-foreground">None yet.</div>
//           ) : (
//             <div className="grid gap-2">
//               {rows.map((row) => (
//                 <Card key={row.id} size="sm">
//                   <CardContent className="grid gap-1">
//                     <div className="grid grid-cols-[1fr_auto] items-start gap-3">
//                       <div className="grid gap-1">
//                         <div className="font-medium">{row.name}</div>
//                         <div className="text-sm text-muted-foreground">
//                           {row.service}
//                           {row.instagramHandle
//                             ? ` • @${row.instagramHandle}`
//                             : ' • Missing IG'}
//                         </div>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="grid gap-2 border-t pt-2">
//           <div className="text-sm font-medium text-destructive">
//             Danger zone
//           </div>
//           <Button
//             variant="destructive"
//             onClick={() => setDeleteConfirmOpen(true)}
//           >
//             Delete event…
//           </Button>
//         </div>
//       </div>

//       <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
//         <AlertDialogContent className="max-w-sm">
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete event?</AlertDialogTitle>
//           </AlertDialogHeader>
//           <div className="text-sm text-muted-foreground">
//             This deletes the event and its supplier links. Suppliers are not
//             deleted.
//           </div>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               variant="destructive"
//               onClick={() => deleteMutation.mutate()}
//             >
//               {deleteMutation.isPending ? 'Deleting…' : 'Delete event'}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   )
// }
