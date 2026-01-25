import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'

export function RouteNotFound() {
  const navigate = useNavigate()

  return (
    <Section className="grid grid-rows-[auto_1fr_auto]">
      <div className="grid gap-0.5">
        <h1 className="text-2xl font-light text-balance">
          Something went wrong
        </h1>
        <p className="text-pretty text-muted-foreground">Page not found</p>
      </div>

      <div className="grid place-items-center">
        <Button
          variant="secondary"
          className="min-w-32"
          onClick={() => navigate({ to: '/' })}
        >
          Go to home
        </Button>
      </div>
    </Section>
  )
}
