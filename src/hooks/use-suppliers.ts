import { useMutation, useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { queryKeys } from '@/hooks/query-keys'
import {
  upsertEventSupplierForCoupleFn,
} from '@/lib/server/event-suppliers'
import {
  createSupplierForCoupleFn,
  searchSuppliersForCoupleFn,
} from '@/lib/server/suppliers'

export function useSupplierSearch(eventId: string, query: string) {
  const searchSuppliers = useServerFn(searchSuppliersForCoupleFn)

  const searchQuery = useQuery({
    queryKey: queryKeys.supplierSearch(eventId, query),
    queryFn: async () => {
      const trimmed = query.trim()
      if (!trimmed) return []
      return await searchSuppliers({ data: { eventId, query: trimmed } })
    },
    enabled: query.trim().length > 0,
  })

  return { searchQuery }
}

export function useCreateSupplierForCouple(eventId: string) {
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
          eventId,
          supplier: data.supplier,
        },
      })

      await upsertEventSupplier({
        data: {
          eventId,
          item: {
            supplierId: supplier.id,
            service: data.service,
            contributionNotes: null,
          },
        },
      })

      return supplier
    },
  })

  const attachExistingMutation = useMutation({
    mutationFn: async (data: { supplierId: string; service: string }) => {
      await upsertEventSupplier({
        data: {
          eventId,
          item: {
            supplierId: data.supplierId,
            service: data.service,
            contributionNotes: null,
          },
        },
      })
    },
  })

  return { createMutation, attachExistingMutation }
}
