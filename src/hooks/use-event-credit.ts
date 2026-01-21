import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import type {
  CreateEventCreditForm,
  DeleteEventCreditForm,
} from '@/lib/types/validation-schema'
import type { EventCreditPage } from '@/lib/types/front-end'
import {
  createEventCreditFn,
  deleteEventCreditFn,
  getEventCreditsFn,
} from '@/lib/server/event-credits'
import { queryKeys } from '@/hooks/query-keys'

export function useEventCredits(eventId: string, shareToken: string) {
  const queryClient = useQueryClient()
  const getEventCredits = useServerFn(getEventCreditsFn)
  const createEventCredit = useServerFn(createEventCreditFn)
  const deleteEventCredit = useServerFn(deleteEventCreditFn)

  const AllCreditsQuery = useSuspenseQuery({
    queryKey: queryKeys.eventSuppliers(eventId),
    queryFn: async () =>
      await getEventCredits({ data: { eventId, shareToken } }),
  })

  const CreateCreditMutation = useMutation({
    mutationFn: async (data: CreateEventCreditForm) => {
      return await createEventCredit({ data: { eventId, shareToken, ...data } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.eventSuppliers(eventId),
      })
    },
  })

  const DeleteCreditMutation = useMutation({
    mutationFn: async (data: DeleteEventCreditForm) => {
      return await deleteEventCredit({ data: { eventId, shareToken, ...data } })
    },
    onMutate: (data) => {
      queryClient.setQueryData<EventCreditPage>(
        queryKeys.eventSuppliers(eventId),
        (old) => {
          old?.credits.filter((credit) => credit.id !== data.supplierId)
          return old
        },
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.eventSuppliers(eventId),
      })
    },
  })

  return { AllCreditsQuery, CreateCreditMutation, DeleteCreditMutation }
}
