import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import {
  SignedIn,
  SignedOut,
  UserButton,
} from '@neondatabase/neon-js/auth/react/ui'
import { Main, Section } from '@/components/ui/section'
import { Brand } from '@/components/header'

export const Route = createFileRoute('/(app)/_appLayout')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Main
      header={
        <Section className="bg-transparent py-0">
          <div className="grid grid-cols-[1fr_auto] content-center items-center gap-4">
            {/* Header left */}
            <SignedIn>
              <Link to="/events">
                <Brand id="brand" />
              </Link>
            </SignedIn>
            <SignedOut>
              <Brand id="brand" />
            </SignedOut>

            {/* Header right */}
            <SignedIn>
              <UserButton
                variant={'ghost'}
                size={'icon'}
                classNames={{
                  trigger: {
                    avatar: {
                      fallback:
                        'bg-primary/60 text-primary-foreground w-full h-full',
                    },
                  },
                  content: {
                    user: {
                      avatar: {
                        fallback:
                          'bg-primary/60 text-primary-foreground w-full h-full',
                      },
                    },
                  },
                }}
              />
            </SignedIn>
          </div>
        </Section>
      }
    >
      <Outlet />
    </Main>
  )
}
