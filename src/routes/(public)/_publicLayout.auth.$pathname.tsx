import { Link, createFileRoute } from '@tanstack/react-router'
import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { AuthView } from '@/components/auth/auth-view'

export const Route = createFileRoute('/(public)/_publicLayout/auth/$pathname')({
  component: Auth,
})

function Auth() {
  const { pathname } = Route.useParams()
  return (
    <Section className="grid content-center gap-12 bg-transparent">
      <p className="text-center text-2xl font-light text-balance">
        Tag everyone —with thanks.
      </p>
      <AuthView pathname={pathname} />
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
