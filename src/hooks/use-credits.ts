import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import type { AuthToken, CreateCreditForm } from '@/lib/types/validation-schema'
import type { EventDetail } from '@/lib/types/front-end'
import { createCreditFn, deleteCreditFn } from '@/lib/server/event-credits'
import { getEventForCoupleFn } from '@/lib/server/events'
import { queryKeys } from '@/hooks/query-keys'
import { isSessionAuthToken, isShareAuthToken } from '@/hooks/use-auth-token'

export function useCredits(eventId: string, authToken: AuthToken) {
  const queryClient = useQueryClient()
  const getEventForCouple = useServerFn(getEventForCoupleFn)
  const createCredit = useServerFn(createCreditFn)

  const getEventForCoupleQuery = useSuspenseQuery({
    queryKey: queryKeys.event(eventId),
    queryFn: async () => {
      if (!isShareAuthToken(authToken) && !isSessionAuthToken(authToken))
        return {} as EventDetail
      return await getEventForCouple({ data: { eventId, authToken } })
    },
  })

  const createCreditMutation = useMutation({
    mutationFn: async (data: CreateCreditForm) => {
      if (!isShareAuthToken(authToken) && !isSessionAuthToken(authToken)) return
      return await createCredit({ data: { eventId, authToken, ...data } })
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
  authToken: AuthToken,
) {
  const queryClient = useQueryClient()
  const deleteCredit = useServerFn(deleteCreditFn)

  const deleteCreditMutation = useMutation({
    mutationFn: async () => {
      if (!isShareAuthToken(authToken) && !isSessionAuthToken(authToken)) return
      return await deleteCredit({ data: { eventId, supplierId, authToken } })
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
