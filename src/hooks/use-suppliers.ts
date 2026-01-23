import { useMutation, useQuery } from '@tanstack/react-query'
import { useDebouncedState } from '@tanstack/react-pacer'
import { useServerFn } from '@tanstack/react-start'
import type { AuthToken, CreateSupplier } from '@/lib/types/validation-schema'
import { queryKeys } from '@/hooks/query-keys'

import { createSupplierFn, searchSuppliersFn } from '@/lib/server/suppliers'
import { DEBOUNCE_INPUT_MS } from '@/lib/constants'

export function useSupplierSearch(eventId: string) {
  const searchSuppliers = useServerFn(searchSuppliersFn)
  const [searchTerm, setSearchTerm, debouncer] = useDebouncedState(
    '',
    { wait: DEBOUNCE_INPUT_MS },
    (state) => ({ isPending: state.isPending }),
  )

  const trimmedSearchTerm = searchTerm.trim()

  const searchQuery = useQuery({
    queryKey: queryKeys.supplierSearch(eventId, trimmedSearchTerm),
    queryFn: async () => {
      return await searchSuppliers({ data: { query: trimmedSearchTerm } })
    },
    enabled: trimmedSearchTerm.length > 0,
  })

  return {
    searchQuery,
    setSearchTerm,
    isPending: debouncer.state.isPending || searchQuery.isFetching,
  }
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
