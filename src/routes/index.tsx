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
      <Section className="bg-transparent p-0">
        <div className="min-h-[75vh] w-full rounded-4xl border border-border/60 bg-muted/70" />
      </Section>

      <Section className="bg-transparent">
        <div className="grid gap-6">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            01
          </span>
          <h1 className="text-5xl font-light leading-[1.05] sm:text-6xl">
            Tag everyone — with thanks.
          </h1>
          <p className="text-lg text-muted-foreground">
            Send one link. Get copy‑ready tags back.
          </p>
        </div>
      </Section>

      <Section className="bg-transparent">
        <div className="grid gap-6">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            02
          </span>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            How it works
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex aspect-square flex-col rounded-4xl border border-border bg-background p-4">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                01
              </span>
              <p className="mt-auto text-sm">
                Send one private link to the couple
              </p>
            </div>
            <div className="flex aspect-square flex-col rounded-4xl border border-border bg-background p-4">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                02
              </span>
              <p className="mt-auto text-sm">
                They search for and add the suppliers involved
              </p>
            </div>
            <div className="flex aspect-square flex-col rounded-4xl border border-border bg-background p-4">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                03
              </span>
              <p className="mt-auto text-sm">
                You get copy‑ready tags, ready to paste into Instagram
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="bg-transparent p-0">
        <div className="h-[50vh] w-full rounded-4xl border border-border/60 bg-muted/70" />
      </Section>

      <Section className="bg-transparent">
        <div className="grid max-w-120 gap-6">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            03
          </span>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Why this exists
          </p>
          <p className="text-2xl font-light leading-relaxed sm:text-3xl">
            Weddings are collaborative.
          </p>
          <p className="text-lg font-light leading-relaxed text-muted-foreground">
            When photos are shared, tagging and thanking the people involved
            strengthens our community.
          </p>
          <p className="text-lg font-light leading-relaxed text-muted-foreground">
            The intent is there. The process breaks down — chasing details,
            incomplete forms, and extra work for couples.
          </p>
          <p className="text-lg font-light leading-relaxed text-muted-foreground">
            Often, details aren’t filled out well — or at all.
          </p>
          <p className="text-lg font-light leading-relaxed text-muted-foreground">
            With Thanks makes it easy to follow through.
          </p>
        </div>
      </Section>

      <Section className="bg-background">
        <div className="grid max-w-120 gap-6">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            04
          </span>
          <h2 className="text-2xl font-light leading-relaxed sm:text-3xl">
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
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            05
          </span>
          <h2 className="text-2xl font-light leading-relaxed sm:text-3xl">
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
                <span className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
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
          <p className="text-2xl font-light leading-relaxed sm:text-3xl">
            Try it on your next wedding.
          </p>
          <Button
            type="button"
            size="lg"
            onClick={() =>
              navigate({ to: '/auth/$pathname', params: { pathname: 'sign-up' } })
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
