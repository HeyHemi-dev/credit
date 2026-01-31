import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(public)/_publicLayout/privacy')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(public)/_publicLayout/privacy"!</div>
}
