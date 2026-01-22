// import { useSuspenseQuery } from '@tanstack/react-query'
// import { useServerFn } from '@tanstack/react-start'
// import { getEventSuppliersForCoupleFn } from '@/lib/server/event-suppliers'
// import { queryKeys } from '@/hooks/query-keys'

// export function useCoupleEvent(shareToken: string) {
//   const getCoupleEvent = useServerFn(getEventSuppliersForCoupleFn)

//   const coupleEventQuery = useSuspenseQuery({
//     queryKey: queryKeys.coupleEvent(shareToken),
//     queryFn: async () => await getCoupleEvent({ data: { shareToken } }),
//   })

//   return { coupleEventQuery }
// }

// useEventList
// - createEvent
// - getEventList

// useEventDetail
// - getEvent
// - updateEvent
// - deleteEvent

// useEventCredit
// - getEventCredits
// - createEventCredit
// - deleteEventCredit
