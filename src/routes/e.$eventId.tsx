import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'
import { RouteError } from '@/components/ui/route-error'
import { Main, Section } from '@/components/ui/section'

import { IntroModal } from '@/components/couple/Intro-modal'
import { Skeleton } from '@/components/ui/skeleton'
import { useEventCredits } from '@/hooks/use-event-credit'
import {
  CreditListItem,
  CreditListItemSkeleton,
} from '@/components/credit/credit-list'
import { ERROR } from '@/lib/errors'

import { shareTokenSchema } from '@/lib/types/validation-schema'
import { Button } from '@/components/ui/button'
import { CreateCreditDrawer } from '@/components/credit/create-credit-drawer'

const creditListRouteSearchSchema = z.object({
  shareToken: shareTokenSchema,
})

export const Route = createFileRoute('/e/$eventId')({
  ssr: false,
  component: CoupleEventRoute,
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
  validateSearch: creditListRouteSearchSchema,
})

function CoupleEventRoute() {
  const { eventId } = Route.useParams()
  const { shareToken } = Route.useSearch()
  if (!shareToken) {
    throw ERROR.NOT_AUTHENTICATED('Share token is required')
  }

  return (
    <>
      <IntroModal />
      <React.Suspense fallback={<CreditListSkeleton />}>
        <CreditList eventId={eventId} shareToken={shareToken} />
      </React.Suspense>
    </>
  )
}

export function CreditList({
  eventId,
  shareToken,
}: {
  eventId: string
  shareToken: string
}) {
  const [createCreditOpen, setCreateCreditOpen] = React.useState(false)
  const { AllCreditsQuery } = useEventCredits(eventId, shareToken)
  const credits = AllCreditsQuery.data.credits

  // add credit button (opens drawer/form)
  // list of credits - includes remove button
  // credit drawer with form for adding a new credit - includes service,
  // and 'search for supplier' combo box
  return (
    <Main>
      <Section>
        <h1 className="text-2xl font-light">
          {AllCreditsQuery.data.eventName}
        </h1>
        <Button onClick={() => setCreateCreditOpen(true)}>Add credit</Button>
        {credits.map((credit) => (
          <CreditListItem
            key={credit.id}
            credit={credit}
            eventId={eventId}
            shareToken={shareToken}
          />
        ))}
      </Section>
      <CreateCreditDrawer
        eventId={eventId}
        shareToken={shareToken}
        open={createCreditOpen}
        setOpen={setCreateCreditOpen}
      />
    </Main>
  )
}

function CreditListSkeleton() {
  return (
    <Main>
      <Section>
        <Skeleton className="w-full h-14" />

        <CreditListItemSkeleton />
        <CreditListItemSkeleton />
        <CreditListItemSkeleton />
      </Section>
    </Main>
  )
}
