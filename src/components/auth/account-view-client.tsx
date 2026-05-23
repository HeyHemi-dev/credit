import { RedirectToSignIn as BetterAuthRedirectToSignIn } from '@daveyplate/better-auth-ui'
import { AuthUiShell } from '@/components/auth/auth-ui-shell'

export function RedirectToSignInClient() {
  return (
    <AuthUiShell>
      <BetterAuthRedirectToSignIn />
    </AuthUiShell>
  )
}
