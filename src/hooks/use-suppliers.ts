import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { queryKeys } from '@/hooks/query-keys'
import {
  upsertEventSupplierForCoupleFn,
} from '@/lib/server/event-suppliers'
import {
  createSupplierForCoupleFn,
  searchSuppliersForCoupleFn,
} from '@/lib/server/suppliers'

export function useSupplierSearch(shareToken: string, query: string) {
  const searchSuppliers = useServerFn(searchSuppliersForCoupleFn)

  const searchQuery = useSuspenseQuery({
    queryKey: queryKeys.supplierSearch(shareToken, query),
    queryFn: async () => {
      const trimmed = query.trim()
      if (!trimmed) return []
      return await searchSuppliers({ data: { shareToken, query: trimmed } })
    },
  })

  return { searchQuery }
}

export function useCreateSupplierForCouple(shareToken: string) {
  const queryClient = useQueryClient()
  const createSupplier = useServerFn(createSupplierForCoupleFn)
  const upsertEventSupplier = useServerFn(upsertEventSupplierForCoupleFn)

  const createMutation = useMutation({
    mutationFn: async (data: {
      supplier: {
        name: string
        email: string
        instagramHandle: string | null
        tiktokHandle: string | null
        region: string | null
      }
      service: string
    }) => {
      const supplier = await createSupplier({
        data: {
          shareToken,
          supplier: data.supplier,
        },
      })

      await upsertEventSupplier({
        data: {
          shareToken,
          item: {
            supplierId: supplier.id,
            service: data.service,
            contributionNotes: null,
          },
        },
      })

      return supplier
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.coupleEvent(shareToken),
      })
    },
  })

  const attachExistingMutation = useMutation({
    mutationFn: async (data: { supplierId: string; service: string }) => {
      await upsertEventSupplier({
        data: {
          shareToken,
          item: {
            supplierId: data.supplierId,
            service: data.service,
            contributionNotes: null,
          },
        },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.coupleEvent(shareToken),
      })
    },
  })

  return { createMutation, attachExistingMutation }
}
