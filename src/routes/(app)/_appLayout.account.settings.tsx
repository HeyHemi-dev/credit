import { createFileRoute } from '@tanstack/react-router'
import { AccountNav } from '@/components/auth/account-nav'
import { AccountSettingsView } from '@/components/auth/auth-wrappers'
import { Section } from '@/components/ui/section'

export const Route = createFileRoute('/(app)/_appLayout/account/settings')({
  component: AccountSettings,
})

function AccountSettings() {
  return (
    <Section>
      <AccountNav />
      <AccountSettingsView />
    </Section>
  )
}
