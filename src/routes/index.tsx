import { createFileRoute } from '@tanstack/react-router'
import { CheckmarkSquare02Icon, Copy01Icon } from '@hugeicons/core-free-icons'
import React from 'react'
import type { Credit } from '@/lib/types/front-end'
import { RouteError } from '@/components/route-error'
import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'

import { useAuthToken } from '@/hooks/use-auth-token'
import { AUTH_STATUS, SERVICE } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { ActionButton } from '@/components/copy-button'
import { formatInstagramCredits } from '@/lib/formatters'
import { useClipboard } from '@/hooks/use-clipboard'
import { Textarea } from '@/components/ui/textarea'

export const Route = createFileRoute('/')({
  ssr: false,
  component: RouteComponent,
  errorComponent: ({ error, reset }) => (
    <RouteError error={error} reset={reset} />
  ),
})

function RouteComponent() {
  // TODO: implement marketing page

  const authToken = useAuthToken()
  const navigate = Route.useNavigate()
  const { isCopied, copy } = useClipboard()
  const [textAreaValue, setTextAreaValue] = React.useState('')

  if (authToken.status === AUTH_STATUS.AUTHENTICATED)
    navigate({ to: '/events', replace: true })

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
            Copy-ready and formatted for Instagram{' '}
            <span className="italic">—&#8288;with thanks.</span>
          </p>
        </TextBlock>
        {/* <Button
          size="lg"
          variant="default"
          className="min-w-32 justify-self-start bg-linear-to-br from-teal-400 to-primary shadow-xl shadow-primary/20"
          onClick={handleCTA}
        >
          Try it for Free
        </Button> */}

        <div className="grid gap-4">
          <div className="grid gap-0.5">
            <SectionHeading text="What you get" />
            <p className="text-sm text-pretty text-muted-foreground/60">
              Example tags you'd get back from your couple, ready to paste into
              Instagram.
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
                placeholder="Click to copy, then paste to see the format."
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

      <Section className="grid gap-4 rounded-none bg-transparent p-0">
        <InsetDiv>
          <SectionHeading text="How it works" />
        </InsetDiv>

        <HowItWorksCard
          index="01"
          description="Create a private event link and send it to your couple"
        />
        <HowItWorksCard
          index="02"
          description="They search and add the suppliers they worked with"
        />
        <HowItWorksCard
          index="03"
          description="You get copy‑ready tags, ready to paste into Instagram"
        />
      </Section>

      {/* <Section className="min-h-[75svh] bg-linear-to-br from-primary/60 to-primary p-0"></Section> */}

      <Section className="min-h-[75svh] content-center bg-transparent py-24">
        <SectionHeading text="Why this exists" />
        <TextBlock className="text-3xl">
          <p className="leading-snug">
            Weddings are collaborative. When photos are shared, tagging and
            thanking the people involved strengthens our community.
          </p>
          <p className="leading-snug">
            We have good intentions, but sometimes the process breaks down
            —&#8288;chasing details, incomplete forms, and extra work for
            couples. The result; details that aren’t filled out well{' '}
            <span className="italic">...if at all.</span>
          </p>
          <p className="leading-snug font-normal">
            With Thanks makes it easy to follow through —&#8288;for suppliers{' '}
            <span className="italic">and couples.</span>
          </p>
        </TextBlock>
      </Section>

      <Section className="flex min-h-[75svh] flex-col justify-between bg-background">
        <SectionHeading text="Built for wedding professionals" />

        <TextBlock className="text-4xl">
          <p className="leading-snug">
            With Thanks is built by a working photographer, and was shaped
            around how weddings are actually delivered.
          </p>
          <p className="leading-snug">
            It's not trying to transform your workflow —&#8288;it fits quietly
            alongside the tools you already use, and focuses on making this one
            part of the process easier.
          </p>
        </TextBlock>
      </Section>

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

      <Section className="min-h-[33svh] content-center bg-linear-to-br from-teal-400 to-primary text-primary-foreground">
        <div className="grid justify-items-center gap-6 text-center">
          <h2 className="text-3xl leading-relaxed font-light">
            Try it for your next wedding.
          </h2>
          <Button
            size="lg"
            variant="ghost"
            className="min-w-32 border border-primary-foreground"
            onClick={handleCTA}
          >
            Try it for Free
          </Button>
          <p className="text-sm font-light text-balance">
            Try it on one wedding. No setup, no commitment.
          </p>
        </div>
      </Section>

      <div className="h-24" />
    </>
  )
}

function InsetDiv({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('px-6', className)} {...props}>
      {children}
    </div>
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
    <InsetDiv className="flex min-h-[25svh] flex-col justify-between gap-6 rounded-4xl bg-background p-6">
      <span className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        {index}
      </span>
      <p className="text-3xl leading-snug font-light text-pretty">
        {description}
      </p>
    </InsetDiv>
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
