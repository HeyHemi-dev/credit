import { RedirectToSignIn } from '@daveyplate/better-auth-ui'
import { AuthUiShell } from '@/components/auth/auth-ui-shell.client'

export function RedirectToSignInClient() {
  return (
    <AuthUiShell>
      <RedirectToSignIn />
    </AuthUiShell>
  )
}
