import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import type { AuthToken, CreateCreditForm } from '@/lib/types/validation-schema'
import type { EventDetail } from '@/lib/types/front-end'
import type { Service } from '@/lib/constants'
import { createCreditFn, deleteCreditFn } from '@/lib/server/event-credits'
import {
  getEventForCoupleByShareTokenFn,
  getEventForCoupleFn,
} from '@/lib/server/events'
import { queryKeys } from '@/hooks/query-keys'
import { isSessionAuth, isShareAuth } from '@/hooks/use-auth'

export function useCredits(eventId: string, authToken: AuthToken) {
  const queryClient = useQueryClient()
  const getEventForCouple = useServerFn(getEventForCoupleFn)
  const createCredit = useServerFn(createCreditFn)

  /**
   * @deprecated
   */
  const getEventForCoupleQuery = useSuspenseQuery({
    queryKey: queryKeys.event(eventId),
    queryFn: async () => {
      if (!isShareAuth(authToken) && !isSessionAuth(authToken))
        return {} as EventDetail
      return await getEventForCouple({ data: { eventId, authToken } })
    },
  })

  const createCreditMutation = useMutation({
    mutationFn: async (data: CreateCreditForm) => {
      if (!isShareAuth(authToken) && !isSessionAuth(authToken)) return
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

export function useCreditsByShareToken(
  shareToken: string,
  authToken: AuthToken,
) {
  const queryClient = useQueryClient()
  const getEventForCoupleByShareToken = useServerFn(
    getEventForCoupleByShareTokenFn,
  )
  const createCredit = useServerFn(createCreditFn)

  const getEventForCoupleByShareTokenQuery = useSuspenseQuery({
    queryKey: queryKeys.coupleEvent(shareToken),
    queryFn: async () => {
      if (!isShareAuth(authToken)) return {} as EventDetail
      return await getEventForCoupleByShareToken({
        data: { shareToken, authToken },
      })
    },
  })

  const createCreditMutation = useMutation({
    mutationFn: async (data: CreateCreditForm & { eventId: string }) => {
      if (!isShareAuth(authToken)) return
      return await createCredit({ data: { authToken, ...data } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.coupleEvent(shareToken),
      })
    },
  })

  return { getEventForCoupleByShareTokenQuery, createCreditMutation }
}

export function useCredit(
  eventId: string,
  supplierId: string,
  service: Service,
  authToken: AuthToken,
) {
  const queryClient = useQueryClient()
  const deleteCredit = useServerFn(deleteCreditFn)

  const deleteCreditMutation = useMutation({
    mutationFn: async () => {
      if (!isShareAuth(authToken) && !isSessionAuth(authToken)) return
      return await deleteCredit({
        data: { eventId, supplierId, service, authToken },
      })
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
