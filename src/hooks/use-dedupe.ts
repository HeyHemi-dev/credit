import { useServerFn } from '@tanstack/react-start'
import { useQuery } from '@tanstack/react-query'
import { useDebouncedState } from '@tanstack/react-pacer'
import { dedupeSuppliersFn } from '@/lib/server/suppliers'
import { queryKeys } from '@/hooks/query-keys'
import { DEBOUNCE_INPUT_MS } from '@/lib/constants'
import { dedupeSuppliersSchema } from '@/lib/types/validation-schema'

export function useDedupe() {
  const dedupeSuppliers = useServerFn(dedupeSuppliersFn)
  const [dedupeName, setDedupeName] = useDebouncedState<string>('', {
    wait: DEBOUNCE_INPUT_MS,
  })
  const [dedupeEmail, setDedupeEmail] = useDebouncedState<string>('', {
    wait: DEBOUNCE_INPUT_MS,
  })

  const dedupeData = { email: dedupeEmail, name: dedupeName }
  const dedupeEnabled = dedupeSuppliersSchema.safeParse(dedupeData).success

  const dedupeQuery = useQuery({
    queryKey: queryKeys.supplierDedupe(dedupeEmail, dedupeName),
    queryFn: async () => dedupeSuppliers({ data: dedupeData }),
    enabled: dedupeEnabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  return { dedupeQuery, setDedupeEmail, setDedupeName }
}
