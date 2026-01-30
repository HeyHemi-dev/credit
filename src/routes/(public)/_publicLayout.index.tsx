import { createFileRoute } from '@tanstack/react-router'
import { CheckmarkSquare02Icon, Copy01Icon } from '@hugeicons/core-free-icons'
import React from 'react'
import type { Credit } from '@/lib/types/front-end'
import { RouteError } from '@/components/route-error'
import { Section, SectionContent } from '@/components/ui/section'
import { Button } from '@/components/ui/button'

import { SERVICE } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { ActionButton } from '@/components/copy-button'
import { formatInstagramCredits } from '@/lib/formatters'
import { useClipboard } from '@/hooks/use-clipboard'
import { Textarea } from '@/components/ui/textarea'

export const Route = createFileRoute('/(public)/_publicLayout/')({
  ssr: false,
  component: RouteComponent,
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const { isCopied, copy } = useClipboard()
  const [textAreaValue, setTextAreaValue] = React.useState('')

  const handleCTA = () => {
    navigate({
      to: '/auth/$pathname',
      params: { pathname: 'sign-up' },
    })
  }

  const instagramText = React.useMemo(() => {
    return formatInstagramCredits(SAMPLE_CREDITS)
  }, [SAMPLE_CREDITS])

  return (
    <>
      {/* Hero */}
      <Section className="min-h-[75svh] content-center gap-12 rounded-none bg-transparent py-24">
        <TextBlock>
          <p className="text-sm leading-normal font-normal tracking-[0.2em] text-muted-foreground uppercase">
            Made for wedding professionals
          </p>
          <h1 className="text-5xl leading-tight font-light sm:text-6xl">
            Tag everyone. Effortlessly.
          </h1>
          <p className="text-xl font-light">
            Send one link. Get wedding supplier{' '}
            <span className="text-muted-foreground/60">@</span>tags back.
            formatted and ready-to-paste into Instagram{' '}
            <span className="italic">—&#8288;with thanks.</span>
          </p>
        </TextBlock>

        {/* Demo */}
        <div className="grid gap-4">
          <div className="grid gap-0.5">
            <SectionHeading text="Try it" />
            <p className="text-sm text-pretty text-muted-foreground/60">
              Example tags you'd get back from your couple, ready-to-paste into
              an Instagram caption.
            </p>
          </div>
          <div className="grid gap-4">
            <ActionButton
              labels={{ idle: 'Copy for Instagram', acting: 'Copied' }}
              icons={{ idle: Copy01Icon, acting: CheckmarkSquare02Icon }}
              onClick={() => copy(instagramText)}
              isActing={isCopied}
              className="min-w-32 justify-self-start"
            />
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setTextAreaValue('')
              }}
              className="grid gap-4"
            >
              <Textarea
                placeholder="Click above to copy the example tags, then paste here to see the format."
                value={textAreaValue}
                onChange={(e) => setTextAreaValue(e.target.value)}
              />
              <Button
                type="submit"
                className="min-w-32 justify-self-end"
                variant="outline"
                disabled={!textAreaValue}
              >
                Clear
              </Button>
            </form>
          </div>
        </div>
      </Section>

      {/* How it works */}
      <Section className="grid gap-4 rounded-none bg-transparent p-0">
        <SectionContent>
          <SectionHeading text="How it works" />
        </SectionContent>

        {(() => {
          const steps = [
            'Create a private event link and send it to your couple',
            'They search and add the suppliers they worked with',
            'You get copy‑ready tags, ready to paste into Instagram',
          ]

          return steps.map((step, index) => (
            <SectionContent className="flex min-h-[25svh] flex-col justify-between gap-6 rounded-4xl bg-background p-6">
              <span className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-3xl leading-snug font-light text-pretty">
                {step}
              </p>
            </SectionContent>
          ))
        })()}
      </Section>

      {/* Why this exists */}
      <Section className="min-h-[75svh] content-center gap-6 bg-transparent py-24">
        <SectionHeading text="Why this exists" />
        <TextBlock className="text-3xl">
          <p className="leading-snug">
            Weddings are collaborative. When photos are shared, tagging and
            thanking the people involved strengthens our community.
          </p>
          <p className="leading-snug">
            We have good intentions, but sometimes the process breaks down
            —&#8288;chasing details, incomplete forms, and extra work for
            couples.
          </p>
          <p className="leading-snug">
            The result: details that aren’t filled out well{' '}
            <span className="italic">...if at all.</span>
          </p>
          <p className="leading-snug font-normal">
            With Thanks makes it easy to follow through —&#8288;for suppliers{' '}
            <span className="italic">and couples.</span>
          </p>
        </TextBlock>
      </Section>

      {/* About */}
      <Section className="flex flex-col justify-between bg-background">
        <SectionHeading text="Built for wedding professionals" />

        <TextBlock className="text-2xl text-muted-foreground">
          <p className="leading-snug">
            With Thanks is built by Hemi{' '}
            <a
              href="https://patina.photo"
              target="_blank"
              className="text-primary"
            >
              @patina.photo.nz
            </a>
            , a working photographer, and was shaped around how weddings are
            actually delivered.
          </p>
          <p className="leading-snug">
            It's not trying to transform your workflow —&#8288;it fits quietly
            alongside the tools you already use, and focuses on making this one
            part of the process easier.
          </p>
        </TextBlock>
      </Section>

      {/* Trust */}
      <Section className="gap-6 rounded-none bg-transparent py-24">
        <SectionHeading text="You're in control" />

        <ol className="grid list-outside list-[decimal-leading-zero] gap-6 pl-[2ch] text-2xl font-light marker:text-sm marker:font-normal marker:tracking-[0.2em] marker:text-foreground marker:uppercase">
          <li>
            <p className="inline">No accounts or sign‑in for couples</p>
          </li>
          <li>
            <p className="inline">Private links, shared only by you</p>
          </li>
          <li>
            <p className="inline">Nothing is posted automatically</p>
          </li>
          <li>
            <p className="inline">You decide when and how tags are used</p>
          </li>
        </ol>

        <p className="text-xl leading-snug font-medium text-pretty">
          With Thanks exists to support your work, not get in the way of it.
        </p>
      </Section>

      {/* CTA */}
      <Section className="min-h-[33svh] content-center justify-items-center gap-6 bg-linear-to-br from-teal-400 to-primary text-center text-primary-foreground">
        <h2 className="text-3xl leading-relaxed font-light">
          Try it for your next wedding.
        </h2>
        <Button
          size="lg"
          variant="ghost"
          className="min-w-[9em] border border-primary-foreground"
          onClick={handleCTA}
        >
          Start Free
        </Button>
        <p className="text-sm font-light text-balance">
          One event included. No setup, no commitment.
        </p>
      </Section>

      <div className="h-24" />
    </>
  )
}

function SectionHeading({ text }: { text: string }) {
  return (
    <h2 className="text-sm leading-normal font-normal tracking-[0.2em] text-muted-foreground uppercase">
      {text}
    </h2>
  )
}

function TextBlock({ className, children }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'grid gap-[1.2em] text-xl font-light text-pretty',
        className,
      )}
    >
      {children}
    </div>
  )
}

function HowItWorksCard({
  index,
  description,
}: {
  index: string
  description: string
}) {
  return (
    <SectionContent className="flex min-h-[25svh] flex-col justify-between gap-6 rounded-4xl bg-background p-6">
      <span className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        {index}
      </span>
      <p className="text-3xl leading-snug font-light text-pretty">
        {description}
      </p>
    </SectionContent>
  )
}

const SAMPLE_CREDITS: Array<Credit> = [
  {
    id: '1',
    name: 'Patina Photo',
    email: 'hello@patina.photo',
    instagramHandle: 'patina.photo.nz',
    tiktokHandle: null,
    service: SERVICE.PHOTOGRAPHER,
    contributionNotes: null,
  },
  {
    id: '2',
    name: 'Boomrock Wellington',
    email: 'functions@boomrock.co.nz',
    instagramHandle: 'boomrocklodge',
    tiktokHandle: null,
    service: SERVICE.VENUE,
    contributionNotes: null,
  },
  {
    id: '3',
    name: 'Stiletto studio',
    email: 'becslake@stilettostudio.co.nz',
    instagramHandle: 'stilettostudiocakes',
    tiktokHandle: null,
    service: SERVICE.CAKE,
    contributionNotes: null,
  },
  {
    id: '4',
    name: 'The Rolling Mill',
    email: 'info@therollingmill.com',
    instagramHandle: 'therollingmill',
    tiktokHandle: null,
    service: SERVICE.RINGS,
    contributionNotes: null,
  },
]
