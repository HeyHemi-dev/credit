import { createFileRoute } from '@tanstack/react-router'
import { micromark } from 'micromark'
import privacyPolicyMd from '@/static/with-thanks_privacy-policy.md?raw'
import { Section } from '@/components/ui/section'

export const Route = createFileRoute('/(public)/_publicLayout/privacy')({
  component: RouteComponent,
  loader: () => {
    return {
      privacyPolicyHtml: micromark(privacyPolicyMd),
    }
  },
})

function RouteComponent() {
  const { privacyPolicyHtml } = Route.useLoaderData()
  return (
    <Section>
      <div className="grid gap-4">
        <h1 className="text-4xl leading-tight font-light">Privacy Policy</h1>
        <div
          className="prose numbered-headings"
          dangerouslySetInnerHTML={{ __html: privacyPolicyHtml }}
        />
      </div>
    </Section>
  )
}
