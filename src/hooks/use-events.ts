import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import type { CreateEvent } from '@/lib/types/validation-schema'
import { queryKeys } from '@/hooks/query-keys'
import {
  createEventFn,
  deleteEventFn,
  getEventFn,
  listEventsFn,
} from '@/lib/server/events'
import { logger } from '@/lib/logger'

export function useEvents(authUserId: string) {
  const queryClient = useQueryClient()
  const listEvents = useServerFn(listEventsFn)
  const createEvent = useServerFn(createEventFn)

  const getEventListQuery = useSuspenseQuery({
    queryKey: queryKeys.events(authUserId),
    queryFn: async () => await listEvents({ data: authUserId }),
  })

  const createEventMutation = useMutation({
    mutationFn: async (data: CreateEvent) => {
      await createEvent({ data: { ...data, authUserId } })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.events(authUserId),
      })
    },
    onError: (error) => {
      logger.error('useEvents.createEvent', { error })
    },
  })

  return { getEventListQuery, createEventMutation }
}

export function useEvent(eventId: string, authUserId: string) {
  const queryClient = useQueryClient()
  const getEvent = useServerFn(getEventFn)
  const deleteEvent = useServerFn(deleteEventFn)

  const getEventQuery = useSuspenseQuery({
    queryKey: queryKeys.event(eventId),
    queryFn: async () => await getEvent({ data: { eventId, authUserId } }),
  })

  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      await deleteEvent({ data: { eventId, authUserId } })
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.events(authUserId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.event(eventId),
        }),
      ])
    },
    onError: (error) => {
      logger.error('useEvent.deleteEvent', { error })
    },
  })

  return { getEventQuery, deleteEventMutation }
}
