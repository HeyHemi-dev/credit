import { createFileRoute } from '@tanstack/react-router'
import { AccountNav } from '@/components/auth/account-nav'
import { AccountSecurityView } from '@/components/auth/auth-wrappers'
import { Section } from '@/components/ui/section'

export const Route = createFileRoute('/(app)/_appLayout/account/security')({
  component: AccountSecurity,
})

function AccountSecurity() {
  return (
    <Section>
      <AccountNav />
      <AccountSecurityView />
    </Section>
  )
}
