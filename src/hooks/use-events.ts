import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import type { AuthToken, CreateEvent } from '@/lib/types/validation-schema'
import { queryKeys } from '@/hooks/query-keys'
import {
  createEventFn,
  deleteEventFn,
  getEventFn,
  listEventsFn,
} from '@/lib/server/events'
import { logger } from '@/lib/logger'
import {
  isSessionAuthToken,
  requireSessionAuthToken,
} from '@/hooks/use-auth-token'

export function useEvents(authUserId: string) {
  const listEvents = useServerFn(listEventsFn)

  const getEventListQuery = useSuspenseQuery({
    queryKey: queryKeys.events(authUserId),
    queryFn: async () => await listEvents({ data: authUserId }),
  })

  return { getEventListQuery }
}

export function useCreateEvent(authToken: AuthToken) {
  const queryClient = useQueryClient()
  const createEvent = useServerFn(createEventFn)

  return useMutation({
    mutationFn: async (data: CreateEvent) => {
      const session = requireSessionAuthToken(authToken)
      await createEvent({
        data: {
          ...data,
          authUserId: session.authUserId,
          sessionToken: session.token,
        },
      })
    },
    onSuccess: async () => {
      if (!isSessionAuthToken(authToken)) return
      await queryClient.invalidateQueries({
        queryKey: queryKeys.events(authToken.authUserId),
      })
    },
  })
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
