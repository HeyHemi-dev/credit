import { createFileRoute } from '@tanstack/react-router'
import { micromark } from 'micromark'
import { Section } from '@/components/ui/section'
import termsOfServiceMd from '@/static/with-thanks_terms-of-user.md?raw'

export const Route = createFileRoute('/(public)/_publicLayout/terms')({
  component: RouteComponent,
  loader: () => {
    return {
      termsOfServiceHtml: micromark(termsOfServiceMd),
    }
  },
})

function RouteComponent() {
  const { termsOfServiceHtml } = Route.useLoaderData()
  return (
    <Section>
      <div className="grid gap-4">
        <h1 className="text-4xl leading-tight font-light">Terms of Service</h1>
        <div
          className="prose numbered-headings"
          dangerouslySetInnerHTML={{ __html: termsOfServiceHtml }}
        />
      </div>
    </Section>
  )
}
