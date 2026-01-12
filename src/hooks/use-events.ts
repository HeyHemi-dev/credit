import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import queryKeys from './query-keys'
import type { CreateEvent } from '@/lib/types/validation-schema'
import type { EventListItem } from '@/lib/types/front-end'
import { createEventFn, listEventsFn } from '@/lib/server/events-copy'

export function useEvents(userId: string) {
  const queryClient = useQueryClient()
  const listEvents = useServerFn(listEventsFn)
  const createEvent = useServerFn(createEventFn)

  const eventsQuery = useQuery({
    queryKey: queryKeys.events(userId),
    queryFn: async () => await listEvents(),
  })

  const eventsMutation = useMutation({
    mutationFn: async (data: CreateEvent) => {
      await createEvent({ data })
      // optimistic update
      queryClient.setQueryData(
        queryKeys.events(userId),
        (old: Array<EventListItem>) => [...old, data],
      )
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.events(userId),
      })
    },

    onError: () => {
      queryClient.setQueryData(
        queryKeys.events(userId),
        (old: Array<EventListItem>) => old,
      )
    },
  })

  return { eventsQuery, eventsMutation }
}
