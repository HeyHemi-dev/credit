import { AuthView as BetterAuthView } from '@daveyplate/better-auth-ui'
import { ClientOnly, Link, createFileRoute } from '@tanstack/react-router'
import { AuthUiShell } from '@/components/auth/auth-ui-shell'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { Skeleton } from '@/components/ui/skeleton'
import { pageTitle } from '@/lib/seo'

export const Route = createFileRoute('/(public)/_publicLayout/auth/sign-up')({
  head: () => ({
    meta: [{ title: pageTitle('Sign Up') }],
  }),
  component: SignUp,
})

function SignUp() {
  const fallback = <Skeleton className="mx-auto h-80 w-full max-w-md" />

  return (
    <Section className="grid content-center gap-12 bg-transparent">
      <p className="text-center text-2xl font-light text-balance">
        Tag everyone —with thanks.
      </p>
      <ClientOnly fallback={fallback}>
        <AuthUiShell>
          <BetterAuthView
            pathname="sign-up"
            localization={{
              SIGN_IN: 'Log in as a wedding supplier',
              SIGN_UP: 'Sign up as a wedding supplier',
            }}
            classNames={{
              base: 'max-w-auto',
              header: 'text-center',
              title: 'text-2xl font-light text-balance',
              description: 'text-sm text-muted-foreground text-pretty',
            }}
            cardFooter={
              <p className="grow text-center text-xs text-balance text-muted-foreground/60">
                By continuing, you agree to our{' '}
                <Link to="/terms" target="_blank">
                  Terms of Use
                </Link>{' '}
                and{' '}
                <Link to="/privacy" target="_blank">
                  Privacy Policy
                </Link>
              </p>
            }
          />
        </AuthUiShell>
      </ClientOnly>
      <div className="grid content-center gap-1 text-center text-balance">
        <p>
          For wedding professionals. Couples never need to create an account.
        </p>
        <Button
          variant="link"
          render={(props) => (
            <Link to="/" className={props.className}>
              Learn More
            </Link>
          )}
        />
      </div>
    </Section>
  )
}
