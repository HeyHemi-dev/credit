import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDebouncedState } from '@tanstack/react-pacer'
import { useServerFn } from '@tanstack/react-start'
import type {
  AuthToken,
  CreateSupplier,
  UpdateSupplierProfile,
} from '@/lib/types/validation-schema'
import { queryKeys } from '@/hooks/query-keys'

import {
  createSupplierFn,
  getSupplierFn,
  searchSuppliersFn,
  updateMySupplierProfileFn,
} from '@/lib/server/suppliers'
import { DEBOUNCE_INPUT_MS } from '@/lib/constants'
import { isSessionAuth, isShareAuth } from '@/hooks/use-auth'

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

export function useSupplier(authToken?: AuthToken) {
  const queryClient = useQueryClient()
  const createSupplier = useServerFn(createSupplierFn)
  const updateMySupplierProfile = useServerFn(updateMySupplierProfileFn)

  const createMutation = useMutation({
    mutationFn: async (data: CreateSupplier) => {
      if (!authToken) throw new Error('Auth token is required to create a supplier')

      const supplier = await createSupplier({
        data: { ...data, authToken },
      })

      return supplier
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateSupplierProfile) => {
      return await updateMySupplierProfile({ data })
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.supplierClaim(),
        }),
        queryClient.invalidateQueries({
          queryKey: ['supplier'],
        }),
      ])
    },
  })

  return { createMutation, updateProfileMutation }
}

export function useSupplierPrefill(
  supplierId: string | undefined,
  authToken: AuthToken,
) {
  const getSupplier = useServerFn(getSupplierFn)
  const isAuthenticated = isShareAuth(authToken) || isSessionAuth(authToken)

  const supplierQuery = useQuery({
    queryKey: queryKeys.supplier(supplierId ?? ''),
    queryFn: async () => {
      if (!supplierId || !isAuthenticated) return null
      return await getSupplier({ data: { supplierId, authToken } })
    },
    enabled: !!supplierId && isAuthenticated,
  })

  return { supplierQuery }
}
