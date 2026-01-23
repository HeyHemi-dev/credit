import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import type { CreateCreditForm } from '@/lib/types/validation-schema'
import type { EventDetail } from '@/lib/types/front-end'
import { createCreditFn, deleteCreditFn } from '@/lib/server/event-credits'
import { getEventForCoupleFn } from '@/lib/server/events'
import { queryKeys } from '@/hooks/query-keys'

export function useCredits(eventId: string, shareToken: string) {
  const queryClient = useQueryClient()
  const getEventForCouple = useServerFn(getEventForCoupleFn)
  const createCredit = useServerFn(createCreditFn)

  const getEventForCoupleQuery = useSuspenseQuery({
    queryKey: queryKeys.event(eventId),
    queryFn: async () =>
      await getEventForCouple({ data: { eventId, shareToken } }),
  })

  const createCreditMutation = useMutation({
    mutationFn: async (data: CreateCreditForm) => {
      return await createCredit({ data: { eventId, shareToken, ...data } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.event(eventId),
      })
    },
  })

  return { getEventForCoupleQuery, createCreditMutation }
}

export function useCredit(
  eventId: string,
  supplierId: string,
  shareToken: string,
) {
  const queryClient = useQueryClient()
  const deleteCredit = useServerFn(deleteCreditFn)

  const deleteCreditMutation = useMutation({
    mutationFn: async () => {
      return await deleteCredit({ data: { eventId, supplierId, shareToken } })
    },
    onMutate: () => {
      queryClient.setQueryData<EventDetail>(queryKeys.event(eventId), (old) => {
        old?.credits.filter((credit) => credit.id !== supplierId)
        return old
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.event(eventId),
      })
    },
  })

  return { deleteCreditMutation }
}
