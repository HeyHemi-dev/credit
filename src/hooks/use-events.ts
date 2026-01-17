import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import type { CreateEvent } from '@/lib/types/validation-schema'
import type { EventListItem } from '@/lib/types/front-end'
import { queryKeys } from '@/hooks/query-keys'
import { createEventFn, deleteEventFn, getEventFn, listEventsFn } from '@/lib/server/events'
import { logger } from '@/lib/logger'

/**
 * list all events, create a new event
 */
export function useEvents(userId: string) {
  const queryClient = useQueryClient()
  const listEvents = useServerFn(listEventsFn)
  const createEvent = useServerFn(createEventFn)

  const eventsQuery = useSuspenseQuery({
    queryKey: queryKeys.events(userId),
    queryFn: async () => await listEvents({ data: userId }),
  })

  const eventsMutation = useMutation({
    mutationFn: async (data: CreateEvent) => {
      await createEvent({ data })
    },

    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.events(data.authUserId),
      })

      // Snapshot previous value for rollback
      const previousEvents = queryClient.getQueryData<Array<EventListItem>>(
        queryKeys.events(data.authUserId),
      )

      // Optimistically update with temporary data
      queryClient.setQueryData<Array<EventListItem>>(
        queryKeys.events(data.authUserId),
        (old = []) => [
          ...old,
          {
            id: 'temp-' + Date.now(), // temporary ID
            eventName: data.eventName,
            weddingDate: data.weddingDate,
            supplierCount: 0,
            shareToken: '', // will be replaced on refetch
          },
        ],
      )

      return { previousEvents }
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.events(userId),
      })
    },

    onError: (error, data, context) => {
      // Rollback on error
      if (context?.previousEvents) {
        queryClient.setQueryData(
          queryKeys.events(data.authUserId),
          context.previousEvents,
        )
      }
      logger.error('useEvents.createEvent', { error })
    },
  })

  return { eventsQuery, eventsMutation }
}

/**
 * get/update/delete a single event
 */
export function useEvent(eventId: string, userId: string) {
  const queryClient = useQueryClient()
  const getEvent = useServerFn(getEventFn)
  const deleteEvent = useServerFn(deleteEventFn)

  const eventQuery = useSuspenseQuery({
    queryKey: queryKeys.event(eventId),
    queryFn: async () =>
      await getEvent({ data: { eventId, authUserId: userId } }),
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await deleteEvent({ data: { eventId, authUserId: userId } })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.events(userId),
      })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.event(eventId),
      })
    },
    onError: (error) => {
      logger.error('useEvent.deleteEvent', { error })
    },
  })

  return { eventQuery, deleteMutation }
}
