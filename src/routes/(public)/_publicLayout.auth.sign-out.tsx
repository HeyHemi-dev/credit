import { AuthView as BetterAuthView } from '@daveyplate/better-auth-ui'
import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import { AuthUiShell } from '@/components/auth/auth-ui-shell'

export const Route = createFileRoute('/(public)/_publicLayout/auth/sign-out')({
  component: SignOut,
})

function SignOut() {
  return (
    <ClientOnly fallback={null}>
      <AuthUiShell>
        <BetterAuthView pathname="sign-out" />
      </AuthUiShell>
    </ClientOnly>
  )
}
