import React from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import z from 'zod'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  MinusSignSquareIcon,
  PlusSignSquareIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons'
import { RouteError } from '@/components/route-error'
import {
  Section,
  SectionContent,
  SectionFooter,
  SectionHeader,
} from '@/components/ui/section'

import { IntroModal } from '@/components/credit/intro-modal'
import { Skeleton } from '@/components/ui/skeleton'
import { useCredits } from '@/hooks/use-credits'
import {
  CreditListItem,
  CreditListItemSkeleton,
} from '@/components/credit/credit-list'

import { shareTokenSchema } from '@/lib/types/validation-schema'
import { Button } from '@/components/ui/button'
import { ActionDrawer } from '@/components/action-drawer'
import { CreateCreditForm } from '@/components/credit/create-credit-form'
import { requireShareAuth, useAuth } from '@/hooks/use-auth'
import {
  CreditProvider,
  useCreditContext,
} from '@/contexts/credit-page-context'
import { uuidToGradient } from '@/lib/id-to-gradient'

const creditListRouteSearchSchema = z.object({
  shareToken: shareTokenSchema,
  panel: z.boolean().optional(),
})

export const Route = createFileRoute('/(app)/_appLayout/e/$eventId')({
  ssr: false,
  component: RouteComponent,
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
  validateSearch: creditListRouteSearchSchema,
  loader: async ({ params }) => {
    const gradient = await uuidToGradient(params.eventId)
    return { gradient }
  },
})

function RouteComponent() {
  const { eventId } = Route.useParams()
  const { shareToken } = Route.useSearch()
  const authToken = useAuth(shareToken)
  const shareAuth = requireShareAuth(authToken)

  return (
    <>
      <CreditProvider authToken={shareAuth} eventId={eventId}>
        <IntroModal />
        <React.Suspense fallback={<CreditPageSkeleton />}>
          <CreditPage />
        </React.Suspense>
      </CreditProvider>
    </>
  )
}

export function CreditPage() {
  const { gradient } = Route.useLoaderData()
  const { eventId, authToken } = useCreditContext()
  const { getEventForCoupleQuery } = useCredits(eventId, authToken)
  const event = getEventForCoupleQuery.data

  const [isOpen, setIsOpen] = useDrawerState()
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  // TODO: add event done checkbox (consider using eventStatus enum with open, submitted, and locked)

  return (
    <>
      <Section className="flex flex-col border-2 border-background p-0">
        <SectionHeader
          style={{
            background: `linear-gradient(${gradient.angle}deg, ${gradient.color1}, ${gradient.color2}`,
          }}
          className="min-h-[25svh] content-end"
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-light">
              <span className="text-muted-foreground">Event: </span>
              <span className="font-light">{event.eventName}</span>
            </h1>
            <p className="text-pretty text-muted-foreground">
              Add the suppliers you worked with on the day. This helps everyone
              to be tagged properly.
            </p>
          </div>
        </SectionHeader>
        <SectionContent className="grow">
          <div className="grid gap-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-light">Suppliers</h2>
              <Button onClick={() => setIsOpen(true)}>
                <HugeiconsIcon icon={Search01Icon} />
                <span>Add Supplier</span>
              </Button>
            </div>

            {event.credits.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <p>No suppliers yet.</p>
                <Button variant={'link'} onClick={() => setIsOpen(true)}>
                  Add one now
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {event.credits.map((credit) => (
                  <CreditListItem key={credit.id} credit={credit} />
                ))}
              </div>
            )}
          </div>
        </SectionContent>
      </Section>

      <ActionDrawer
        state={{ isOpen, setIsOpen }}
        content={{
          title: 'Tag a supplier',
          description:
            'Add one supplier at a time. Try searching first —if they’re not listed, you can create a new one.',
        }}
        setContainerRef={containerRef}
      >
        <CreateCreditForm
          onSubmit={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
          containerRef={containerRef}
        />
      </ActionDrawer>
    </>
  )
}

// Use a locally scoped hook because tanstack requires Route.id to return search params.
export function useDrawerState() {
  const navigate = useNavigate()
  const search = useSearch({ from: Route.id })

  const isOpen = search.panel ?? false

  const setIsOpen = React.useCallback(
    (open: boolean) => {
      navigate({
        to: '.',
        replace: true,
        search: (prev) => ({
          ...prev,
          panel: open ? true : undefined,
        }),
      })
    },
    [navigate],
  )

  return [isOpen, setIsOpen] as const
}

function CreditPageSkeleton() {
  return (
    <Section className="flex flex-col border-2 border-background p-0">
      <Skeleton className="min-h-[25svh] content-end" />

      <SectionContent className="grow">
        <div className="grid gap-6">
          <Skeleton className="h-10 w-full" />
          <div className="grid gap-4">
            <CreditListItemSkeleton />
            <CreditListItemSkeleton />
            <CreditListItemSkeleton />
          </div>
        </div>
      </SectionContent>
    </Section>
  )
}
