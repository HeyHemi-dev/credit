import { createFileRoute } from '@tanstack/react-router'
import { Section } from '@/components/ui/section'

export const Route = createFileRoute('/(public)/_publicLayout/terms')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Section>
      <div>
        <h1 className="text-5xl leading-tight font-light sm:text-6xl">
          Terms of Service
        </h1>
      </div>
    </Section>
  )
}
