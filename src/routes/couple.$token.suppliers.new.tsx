import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Section } from '@/components/ui/section'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { REGION_KEYS, REGION, SERVICE_KEYS, SERVICE } from '@/lib/constants'
import { createSupplierForCoupleFn, searchSuppliersForCoupleFn } from '@/lib/server/suppliers'
import { upsertEventSupplierForCoupleFn, getEventSuppliersForCoupleFn } from '@/lib/server/event-suppliers'

export const Route = createFileRoute('/couple/$token/suppliers/new')({
  component: CreateSupplier,
})

function CreateSupplier() {
  const { token } = Route.useParams()
  const navigate = useNavigate()

  const eventQuery = useQuery({
    queryKey: ['coupleEvent', token],
    queryFn: async () => await getEventSuppliersForCoupleFn({ data: { shareToken: token } }),
  })

  const [step, setStep] = React.useState<'form' | 'dedupe'>('form')
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [service, setService] = React.useState<string>('')
  const [instagramHandle, setInstagramHandle] = React.useState('')
  const [tiktokHandle, setTiktokHandle] = React.useState('')
  const [region, setRegion] = React.useState<string>('')

  React.useEffect(() => {
    if (!region && eventQuery.data?.event.region) {
      setRegion(eventQuery.data.event.region)
    }
  }, [eventQuery.data?.event.region, region])

  const dedupeQuery = useQuery({
    enabled: step === 'dedupe',
    queryKey: ['supplierDedupe', token, name, email],
    queryFn: async () => {
      // Simple v1 heuristic: search by name first; email domain similarity is future.
      const q = name.trim() || email.trim()
      if (!q) return []
      return await searchSuppliersForCoupleFn({ data: { shareToken: token, query: q } })
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const supplier = await createSupplierForCoupleFn({
        data: {
          shareToken: token,
          supplier: {
            name,
            email,
            instagramHandle,
            tiktokHandle,
            region,
          },
        },
      })

      await upsertEventSupplierForCoupleFn({
        data: {
          shareToken: token,
          item: {
            supplierId: supplier.id,
            service,
            contributionNotes: null,
          },
        },
      })

      return supplier
    },
    onSuccess: async () => {
      await navigate({ to: '/couple/$token', params: { token } })
    },
  })

  const attachExistingMutation = useMutation({
    mutationFn: async (supplierId: string) => {
      await upsertEventSupplierForCoupleFn({
        data: {
          shareToken: token,
          item: {
            supplierId,
            service,
            contributionNotes: null,
          },
        },
      })
    },
    onSuccess: async () => {
      await navigate({ to: '/couple/$token', params: { token } })
    },
  })

  return (
    <Section className="py-6">
      <div className="grid gap-3">
        <Button variant="ghost" onClick={() => navigate({ to: '/couple/$token', params: { token } })}>
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create a new supplier</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {step === 'form' ? (
              <>
                <div className="grid gap-1">
                  <div className="text-sm font-medium">Supplier name</div>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="grid gap-1">
                  <div className="text-sm font-medium">Email</div>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="grid gap-1">
                  <div className="text-sm font-medium">Service</div>
                  <Select value={service} onValueChange={(v) => setService(v)}>
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

                <div className="grid gap-1">
                  <div className="text-sm font-medium">Instagram handle (optional)</div>
                  <Input
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="@supplier"
                  />
                </div>

                <div className="grid gap-1">
                  <div className="text-sm font-medium">TikTok handle (optional)</div>
                  <Input
                    value={tiktokHandle}
                    onChange={(e) => setTiktokHandle(e.target.value)}
                    placeholder="@supplier"
                  />
                </div>

                <div className="grid gap-1">
                  <div className="text-sm font-medium">Region (optional)</div>
                  <Select value={region} onValueChange={(v) => setRegion(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGION_KEYS.map((key) => (
                        <SelectItem key={key} value={REGION[key]}>
                          {REGION[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => setStep('dedupe')}
                  disabled={!name.trim() || !email.trim() || !service}
                >
                  Continue
                </Button>
              </>
            ) : (
              <>
                <div className="text-sm text-muted-foreground">
                  Did you mean one of these?
                </div>

                {dedupeQuery.isLoading ? (
                  <div className="text-sm text-muted-foreground">Checking…</div>
                ) : dedupeQuery.data?.length ? (
                  <div className="grid gap-2">
                    {dedupeQuery.data.slice(0, 6).map((s) => (
                      <button
                        key={s.id}
                        className="text-left rounded-xl border px-3 py-2 hover:bg-muted/30"
                        onClick={() => attachExistingMutation.mutate(s.id)}
                      >
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.email}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No close matches.</div>
                )}

                <div className="grid gap-2 pt-2">
                  <Button
                    onClick={() => createMutation.mutate()}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Creating…' : 'No, create new supplier'}
                  </Button>
                  <Button variant="ghost" onClick={() => setStep('form')}>
                    Back
                  </Button>
                </div>
              </>
            )}

            {createMutation.isError ? (
              <div className="text-sm text-destructive">Couldn’t create supplier.</div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}

