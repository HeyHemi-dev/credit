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

export function useEvents(authToken: AuthToken) {
  const listEvents = useServerFn(listEventsFn)
  const sessionAuth = requireSessionAuthToken(authToken)

  const getEventListQuery = useSuspenseQuery({
    queryKey: queryKeys.events(sessionAuth.authUserId),
    queryFn: async () => await listEvents({ data: sessionAuth }),
  })

  return { getEventListQuery }
}

export function useCreateEvent(authToken: AuthToken) {
  const queryClient = useQueryClient()
  const createEvent = useServerFn(createEventFn)
  const sessionAuth = requireSessionAuthToken(authToken)

  return useMutation({
    mutationFn: async (data: CreateEvent) => {
      await createEvent({
        data: {
          ...data,
          authToken: sessionAuth,
        },
      })
    },
    onSuccess: async () => {
      if (!isSessionAuthToken(authToken)) return
      await queryClient.invalidateQueries({
        queryKey: queryKeys.events(sessionAuth.authUserId),
      })
    },
  })
}

export function useEvent(eventId: string, authToken: AuthToken) {
  const queryClient = useQueryClient()
  const getEvent = useServerFn(getEventFn)
  const deleteEvent = useServerFn(deleteEventFn)
  const sessionAuth = requireSessionAuthToken(authToken)

  const getEventQuery = useSuspenseQuery({
    queryKey: queryKeys.event(eventId),
    queryFn: async () =>
      await getEvent({ data: { eventId, authToken: sessionAuth } }),
  })

  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      await deleteEvent({ data: { eventId, authToken: sessionAuth } })
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.events(sessionAuth.authUserId),
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
