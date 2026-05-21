import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDebouncedState } from '@tanstack/react-pacer'
import { useServerFn } from '@tanstack/react-start'
import { DEBOUNCE_INPUT_MS } from '@/lib/constants'
import { queryKeys } from '@/hooks/query-keys'
import {
  claimSupplierFn,
  getMySupplierClaimFn,
  searchSuppliersToClaimFn,
} from '@/lib/server/supplier-claims'

export function useMySupplierClaim() {
  const getMySupplierClaim = useServerFn(getMySupplierClaimFn)

  const claimQuery = useQuery({
    queryKey: queryKeys.supplierClaim(),
    queryFn: async () => {
      return await getMySupplierClaim({ data: {} })
    },
  })

  return { claimQuery }
}

export function useSupplierClaimSearch() {
  const searchSuppliersToClaim = useServerFn(searchSuppliersToClaimFn)
  const [searchTerm, setSearchTerm, debouncer] = useDebouncedState(
    '',
    { wait: DEBOUNCE_INPUT_MS },
    (state) => ({ isPending: state.isPending }),
  )

  const trimmedSearchTerm = searchTerm.trim()

  const searchQuery = useQuery({
    queryKey: queryKeys.supplierClaimSearch(trimmedSearchTerm),
    queryFn: async () => {
      return await searchSuppliersToClaim({
        data: { query: trimmedSearchTerm },
      })
    },
    enabled: trimmedSearchTerm.length > 0,
  })

  return {
    searchQuery,
    setSearchTerm,
    isPending: debouncer.state.isPending || searchQuery.isFetching,
  }
}

export function useClaimSupplier() {
  const queryClient = useQueryClient()
  const claimSupplier = useServerFn(claimSupplierFn)

  const claimMutation = useMutation({
    mutationFn: async (supplierId: string) => {
      return await claimSupplier({ data: { supplierId } })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.supplierClaim(),
      })
    },
  })

  return { claimMutation }
}
