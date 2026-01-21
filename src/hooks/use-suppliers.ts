import { useMutation, useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import type { AuthToken, CreateSupplier } from '@/lib/types/validation-schema'
import { queryKeys } from '@/hooks/query-keys'

import { createSupplierFn, searchSuppliersFn } from '@/lib/server/suppliers'

export function useSupplierSearch(eventId: string, query: string) {
  const searchSuppliers = useServerFn(searchSuppliersFn)
  const trimmedQuery = query.trim()

  const searchQuery = useQuery({
    queryKey: queryKeys.supplierSearch(eventId, trimmedQuery),
    queryFn: async () => {
      return await searchSuppliers({ data: { query: trimmedQuery } })
    },
    enabled: trimmedQuery.length > 0,
  })

  return { searchQuery }
}

export function useCreateSupplier(authToken: AuthToken) {
  const createSupplier = useServerFn(createSupplierFn)

  const createMutation = useMutation({
    mutationFn: async (data: CreateSupplier) => {
      const supplier = await createSupplier({
        data: { ...data, authToken },
      })

      return supplier
    },
  })

  return { createMutation }
}
