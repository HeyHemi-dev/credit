import { createFileRoute } from '@tanstack/react-router'
import { RouteError } from '@/components/route-error'
import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'

import { useAuthToken } from '@/hooks/use-auth-token'
import { AUTH_STATUS } from '@/lib/constants'

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

  if (authToken.status === AUTH_STATUS.AUTHENTICATED)
    navigate({ to: '/events', replace: true })

  return (
    <div className="grid gap-y-20 text-left">
      <Section className="rounded-none bg-transparent p-0 pt-24">
        <div className="grid gap-6">
          <h1 className="text-5xl leading-[1.05] font-light sm:text-6xl">
            Tag everyone — with thanks.
          </h1>
          <p className="text-lg text-muted-foreground">
            Send one link. Get copy‑ready tags back.
          </p>
        </div>
      </Section>

      <Section className="grid gap-4">
        <Section className="rounded-none bg-transparent py-0">
          <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
            How it works
          </p>
        </Section>

        <Section className="flex aspect-3/2 flex-col justify-between p-8">
          <span className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
            01
          </span>
          <p className="text-3xl leading-tight font-light">
            Send one private link to the couple
          </p>
        </Section>

        <Section className="flex aspect-3/2 flex-col justify-between p-8">
          <span className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
            02
          </span>
          <p className="text-3xl leading-tight font-light">
            They search for and add the suppliers involved
          </p>
        </Section>

        <Section className="flex aspect-3/2 flex-col justify-between p-8">
          <span className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
            03
          </span>
          <p className="text-3xl leading-tight font-light">
            You get copy‑ready tags, ready to paste into Instagram
          </p>
        </Section>
      </Section>

      <Section className="bg-transparent p-0">
        <div className="h-[50vh] w-full rounded-4xl border border-border/60 bg-muted/70" />
      </Section>

      <Section className="bg-transparent">
        <div className="grid max-w-120 gap-6">
          <h2 className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
            Why this exists
          </h2>
          <p className="text-2xl leading-relaxed font-light sm:text-3xl">
            Weddings are collaborative.
          </p>
          <p className="text-lg leading-relaxed font-light text-muted-foreground">
            When photos are shared, tagging and thanking the people involved
            strengthens our community.
          </p>
          <p className="text-lg leading-relaxed font-light text-muted-foreground">
            The intent is there. The process breaks down — chasing details,
            incomplete forms, and extra work for couples.
          </p>
          <p className="text-lg leading-relaxed font-light text-muted-foreground">
            Often, details aren’t filled out well — or at all.
          </p>
          <p className="text-lg leading-relaxed font-light text-muted-foreground">
            With Thanks makes it easy to follow through.
          </p>
        </div>
      </Section>

      <Section className="bg-background">
        <div className="grid max-w-120 gap-6">
          <h2 className="text-2xl leading-relaxed font-light sm:text-3xl">
            Built for real workflows
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            With Thanks is built by a working photographer, shaped around how
            weddings actually run.
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            It fits quietly alongside the tools you already use, and focuses on
            making this one part of the process easier.
          </p>
        </div>
      </Section>

      <Section className="bg-background">
        <div className="grid max-w-120 gap-6">
          <h2 className="text-2xl leading-relaxed font-light sm:text-3xl">
            Trust & control
          </h2>
          <div className="grid gap-4">
            {[
              'No accounts or sign‑in for couples',
              'Private links, shared only by you',
              'Nothing is posted automatically',
              'You decide when and how tags are used',
            ].map((item, index) => (
              <div key={item} className="flex gap-4">
                <span className="mt-1 text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {item}
                </p>
              </div>
            ))}
          </div>
          <p className="text-lg leading-relaxed text-muted-foreground">
            This exists to support your work — not get in the way of it.
          </p>
        </div>
      </Section>

      <Section className="bg-transparent">
        <div className="grid justify-items-center gap-6 text-center">
          <p className="text-2xl leading-relaxed font-light sm:text-3xl">
            Try it on your next wedding.
          </p>
          <Button
            type="button"
            size="lg"
            onClick={() =>
              navigate({
                to: '/auth/$pathname',
                params: { pathname: 'sign-up' },
              })
            }
          >
            Try it
          </Button>
        </div>
      </Section>

      <Section className="bg-muted/70">
        <div className="h-24" />
      </Section>
    </div>
  )
}
