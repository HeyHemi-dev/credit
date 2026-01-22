// import * as React from 'react'
// import { useMutation } from '@tanstack/react-query'
// import { AsyncBatcher } from '@tanstack/pacer'
// import type { SupplierSearchResult } from '@/lib/types/front-end'
// import { AUTOSAVE, SERVICE, SERVICE_KEYS, UI_TEXT } from '@/lib/constants'
// import {
//   removeEventSupplierForCoupleFn,
//   upsertEventSupplierForCoupleFn,
// } from '@/lib/server/event-suppliers'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent } from '@/components/ui/card'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { useCoupleEvent } from '@/hooks/use-couple'
// import { SupplierSearchCombobox } from '@/components/couple/supplier-search-combobox'

// type SupplierRow = SupplierSearchResult

// export function SupplierList({ shareToken }: { shareToken: string }) {
//   const [selectedSupplier, setSelectedSupplier] =
//     React.useState<SupplierRow | null>(null)

//   const { coupleEventQuery } = useCoupleEvent(shareToken)
//   const eventId = coupleEventQuery.data.event.id
//   const [rows, setRows] = React.useState(coupleEventQuery.data.rows)

//   const removeMutation = useMutation({
//     mutationFn: async (supplierId: string) => {
//       await removeEventSupplierForCoupleFn({
//         data: { eventId, supplierId },
//       })
//     },
//     onSuccess: (_data, supplierId) => {
//       setRows((prevRows) =>
//         prevRows.filter((row) => row.supplierId !== supplierId),
//       )
//     },
//   })

//   const upsertOne = async (item: {
//     supplierId: string
//     service: string
//     contributionNotes: string
//   }) => {
//     await upsertEventSupplierForCoupleFn({
//       data: { eventId, item },
//     })
//   }

//   const batcherRef =
//     React.useRef<
//       AsyncBatcher<{
//         supplierId: string
//         service: string
//         contributionNotes: string
//       }>
//     >(null)
//   if (!batcherRef.current) {
//     batcherRef.current = new AsyncBatcher(
//       async (items) => {
//         // de-dupe by supplierId (latest wins)
//         const byId = new Map(items.map((i) => [i.supplierId, i]))
//         for (const i of byId.values()) {
//           await upsertOne(i)
//         }
//       },
//       {
//         maxSize: 1000,
//         wait: AUTOSAVE.INTERVAL_MS,
//       },
//     )
//   }

//   const [autosaveState, setAutosaveState] = React.useState<
//     'idle' | 'saving' | 'error'
//   >('idle')

//   const enqueueSave = (item: {
//     supplierId: string
//     service: string
//     contributionNotes: string
//   }) => {
//     setAutosaveState('saving')
//     batcherRef.current?.addItem(item)
//   }

//   React.useEffect(() => {
//     setRows(coupleEventQuery.data.rows)
//     const id = window.setInterval(() => {
//       setAutosaveState('idle')
//     }, AUTOSAVE.INTERVAL_MS)
//     return () => window.clearInterval(id)
//   }, [coupleEventQuery.data.rows])

//   const handleSupplierSelect = (supplier: SupplierRow) => {
//     setSelectedSupplier(supplier)
//   }

//   return (
//     <div className="grid gap-3">
//       <div className="text-xs text-muted-foreground">
//         {autosaveState === 'saving'
//           ? UI_TEXT.AUTOSAVE.SAVING
//           : autosaveState === 'error'
//             ? UI_TEXT.AUTOSAVE.NOT_SAVED_MISSING_FIELD
//             : UI_TEXT.AUTOSAVE.SAVED}
//       </div>

//       <SupplierSearchCombobox
//         eventId={eventId}
//         onSupplierSelect={handleSupplierSelect}
//       />

//       {selectedSupplier ? (
//         <Card size="sm">
//           <CardContent className="grid gap-2">
//             <div className="font-medium">{selectedSupplier.name}</div>
//             <div className="text-xs text-muted-foreground">
//               {selectedSupplier.email}
//             </div>
//             <div className="grid gap-1">
//               <div className="text-sm font-medium">Service</div>
//               <Select
//                 value=""
//                 onValueChange={(service) => {
//                   if (!service) return
//                   enqueueSave({
//                     supplierId: selectedSupplier.id,
//                     service,
//                     contributionNotes: '',
//                   })
//                   setRows((prevRows) => [
//                     ...prevRows,
//                     {
//                       eventId,
//                       supplierId: selectedSupplier.id,
//                       service,
//                       contributionNotes: '',
//                       supplier: {
//                         id: selectedSupplier.id,
//                         name: selectedSupplier.name,
//                         email: selectedSupplier.email,
//                         instagramHandle:
//                           selectedSupplier.instagramHandle || null,
//                         tiktokHandle: selectedSupplier.tiktokHandle || null,
//                         region: selectedSupplier.region || null,
//                       },
//                     },
//                   ])
//                   setSelectedSupplier(null)
//                 }}
//               >
//                 <SelectTrigger className="w-full">
//                   <SelectValue>Select service</SelectValue>
//                 </SelectTrigger>
//                 <SelectContent>
//                   {SERVICE_KEYS.map((key) => (
//                     <SelectItem key={key} value={SERVICE[key]}>
//                       {SERVICE[key]}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <Button variant="ghost" onClick={() => setSelectedSupplier(null)}>
//               Cancel
//             </Button>
//           </CardContent>
//         </Card>
//       ) : null}

//       <div className="grid gap-2">
//         {rows.length === 0 ? (
//           <div className="text-sm text-muted-foreground">No suppliers yet.</div>
//         ) : (
//           rows.map((r) => (
//             <Card key={`${r.eventId}:${r.supplierId}`} size="sm">
//               <CardContent className="grid grid-cols-[1fr_auto] gap-3 items-start">
//                 <div className="grid gap-1">
//                   <div className="font-medium">{r.supplier.name}</div>
//                   <div className="text-xs text-muted-foreground">
//                     {r.service}
//                     {r.supplier.instagramHandle
//                       ? ` • @${r.supplier.instagramHandle}`
//                       : ''}
//                   </div>
//                 </div>
//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   onClick={() => removeMutation.mutate(r.supplierId)}
//                 >
//                   Remove
//                 </Button>
//               </CardContent>
//             </Card>
//           ))
//         )}
//       </div>
//     </div>
//   )
// }
