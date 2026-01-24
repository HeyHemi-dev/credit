import { Link, createFileRoute } from '@tanstack/react-router'
import { AuthView } from '@neondatabase/neon-js/auth/react/ui'
import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/auth/$pathname')({
  component: Auth,
})

function Auth() {
  // TODO: Make clear this is for suppliers to log in, not couples.
  // Add a link for couples to escape this page.

  const { pathname } = Route.useParams()
  return (
    <Section className="grid content-center gap-12 bg-transparent">
      <AuthView
        pathname={pathname}
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
      />
      <div className="grid content-center gap-1 text-center text-pretty">
        <p>Not a wedding supplier, or want more info?</p>
        <Button
          variant="link"
          render={(props) => (
            <Link to="/" className={props.className}>
              About Give Credit
            </Link>
          )}
        />
      </div>
    </Section>
  )
}
