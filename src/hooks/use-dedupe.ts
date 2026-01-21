import { useServerFn } from '@tanstack/react-start'
import { useQuery } from '@tanstack/react-query'
import { useDebouncedState } from '@tanstack/react-pacer'
import { dedupeSuppliersFn } from '@/lib/server/suppliers'
import { queryKeys } from '@/hooks/query-keys'

export function useDedupe() {
  const dedupeSuppliers = useServerFn(dedupeSuppliersFn)
  const [dedupeName, setDedupeName] = useDebouncedState<string>('', {
    wait: 300,
  })
  const [dedupeEmail, setDedupeEmail] = useDebouncedState<string>('', {
    wait: 300,
  })

  const dedupeQuery = useQuery({
    queryKey: queryKeys.supplierDedupe(dedupeEmail, dedupeName),
    queryFn: async () => {
      if (!dedupeEmail || !dedupeName) return []
      return await dedupeSuppliers({
        data: { email: dedupeEmail, name: dedupeName },
      })
    },
    enabled: dedupeEmail.trim().length > 0 && dedupeName.trim().length > 0,
  })

  return { dedupeQuery, setDedupeEmail, setDedupeName }
}
