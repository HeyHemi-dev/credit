import * as React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AsyncBatcher } from '@tanstack/pacer'
import { AUTOSAVE, UI_TEXT } from '@/lib/constants'
import { searchSuppliersForCoupleFn } from '@/lib/server/suppliers'
import {
  getEventSuppliersForCoupleFn,
  removeEventSupplierForCoupleFn,
  upsertEventSupplierForCoupleFn,
} from '@/lib/server/event-suppliers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SERVICE_KEYS, SERVICE } from '@/lib/constants'
import { Link } from '@tanstack/react-router'

type SupplierRow = Awaited<ReturnType<typeof searchSuppliersForCoupleFn>>[number]

export function SupplierList({ shareToken }: { shareToken: string }) {
  const queryClient = useQueryClient()
  const [query, setQuery] = React.useState('')
  const [selectedSupplier, setSelectedSupplier] = React.useState<SupplierRow | null>(null)

  const eventQuery = useQuery({
    queryKey: ['coupleEvent', shareToken],
    queryFn: async () => await getEventSuppliersForCoupleFn({ data: { shareToken } }),
  })

  const searchQuery = useQuery({
    enabled: query.trim().length > 0,
    queryKey: ['supplierSearch', shareToken, query],
    queryFn: async () =>
      await searchSuppliersForCoupleFn({ data: { shareToken, query } }),
  })

  const removeMutation = useMutation({
    mutationFn: async (supplierId: string) => {
      await removeEventSupplierForCoupleFn({ data: { shareToken, supplierId } })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['coupleEvent', shareToken] })
    },
  })

  const upsertOne = async (item: {
    supplierId: string
    service: string
    contributionNotes: string | null
  }) => {
    await upsertEventSupplierForCoupleFn({
      data: { shareToken, item },
    })
  }

  const batcherRef = React.useRef<AsyncBatcher<{ supplierId: string; service: string; contributionNotes: string | null }>>()
  if (!batcherRef.current) {
    batcherRef.current = new AsyncBatcher(
      async (items) => {
        // de-dupe by supplierId (latest wins)
        const byId = new Map(items.map((i) => [i.supplierId, i]))
        for (const i of byId.values()) {
          await upsertOne(i)
        }
      },
      {
        maxSize: 1000,
        wait: AUTOSAVE.INTERVAL_MS,
      },
    )
  }

  const [autosaveState, setAutosaveState] = React.useState<'idle' | 'saving' | 'error'>('idle')

  const enqueueSave = (item: { supplierId: string; service: string; contributionNotes: string | null }) => {
    setAutosaveState('saving')
    batcherRef.current!.addItem(item)
  }

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setAutosaveState('idle')
    }, AUTOSAVE.INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  if (eventQuery.isLoading) {
    return <div className="text-sm text-muted-foreground">Loading suppliers…</div>
  }
  if (eventQuery.isError) {
    return <div className="text-sm text-destructive">Couldn’t load suppliers.</div>
  }

  const rows = eventQuery.data.rows

  return (
    <div className="grid gap-3">
      <div className="text-xs text-muted-foreground">
        {autosaveState === 'saving'
          ? UI_TEXT.AUTOSAVE.SAVING
          : autosaveState === 'error'
            ? UI_TEXT.AUTOSAVE.NOT_SAVED_MISSING_FIELD
            : UI_TEXT.AUTOSAVE.SAVED}
      </div>

      <div className="grid gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search suppliers by name, email, Instagram, TikTok…"
        />
        {searchQuery.isFetching ? (
          <div className="text-xs text-muted-foreground">Searching…</div>
        ) : null}
        {searchQuery.data?.length ? (
          <Card size="sm">
            <CardContent className="grid gap-2">
              {searchQuery.data.slice(0, 6).map((s) => (
                <button
                  key={s.id}
                  className="text-left rounded-xl border px-3 py-2 hover:bg-muted/30"
                  onClick={() => {
                    setSelectedSupplier(s)
                    setQuery('')
                    searchQuery.remove()
                  }}
                >
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.email}</div>
                </button>
              ))}
              <Link
                to="/couple/$token/suppliers/new"
                params={{ token: shareToken }}
                className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground"
              >
                Create a new supplier
              </Link>
            </CardContent>
          </Card>
        ) : query.trim().length > 0 && !searchQuery.isFetching ? (
          <div className="text-xs text-muted-foreground">
            No results.{' '}
            <Link
              to="/couple/$token/suppliers/new"
              params={{ token: shareToken }}
              className="underline underline-offset-4"
            >
              Create a new supplier
            </Link>
          </div>
        ) : null}
      </div>

      {selectedSupplier ? (
        <Card size="sm">
          <CardContent className="grid gap-2">
            <div className="font-medium">{selectedSupplier.name}</div>
            <div className="text-xs text-muted-foreground">{selectedSupplier.email}</div>
            <div className="grid gap-1">
              <div className="text-sm font-medium">Service</div>
              <Select
                value=""
                onValueChange={(service) => {
                  enqueueSave({
                    supplierId: selectedSupplier.id,
                    service,
                    contributionNotes: null,
                  })
                  setSelectedSupplier(null)
                  void queryClient.invalidateQueries({ queryKey: ['coupleEvent', shareToken] })
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_KEYS.map((key) => (
                    <SelectItem key={key} value={SERVICE[key]}>
                      {SERVICE[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" onClick={() => setSelectedSupplier(null)}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-2">
        {rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No suppliers yet.</div>
        ) : (
          rows.map((r) => (
            <Card key={`${r.eventId}:${r.supplierId}`} size="sm">
              <CardContent className="grid grid-cols-[1fr_auto] gap-3 items-start">
                <div className="grid gap-1">
                  <div className="font-medium">{r.supplier.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.service}
                    {r.supplier.instagramHandle ? ` • @${r.supplier.instagramHandle}` : ''}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeMutation.mutate(r.supplierId)}
                >
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

