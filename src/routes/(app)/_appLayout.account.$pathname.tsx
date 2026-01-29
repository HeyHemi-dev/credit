import { Link, createFileRoute } from '@tanstack/react-router'
import { AccountView } from '@neondatabase/neon-js/auth/react/ui'
import { Section } from '@/components/ui/section'

import { Tabs, TabsList } from '@/components/ui/tabs'
import { BackButton } from '@/components/back-button'

export const Route = createFileRoute('/(app)/_appLayout/account/$pathname')({
  component: Account,
})

function Account() {
  const { pathname } = Route.useParams()
  return (
    <Section>
      <AccountNav />
      <AccountView
        pathname={pathname}
        classNames={{
          base: 'grid gap-4 content-start !w-auto',
          sidebar: { base: 'flex flex-row justify-center !w-auto' },
        }}
        hideNav={true}
      />
    </Section>
  )
}

type AccountView = {
  label: string
  pathname: string
  isEnabled: boolean
}

const ACCOUNT_VIEW = {
  SETTINGS: {
    label: 'Settings',
    pathname: 'settings',
    isEnabled: true,
  },
  SECURITY: {
    label: 'Security',
    pathname: 'security',
    isEnabled: true,
  },
  API_KEYS: {
    label: 'API Keys',
    pathname: 'api-keys',
    isEnabled: false,
  },
  ORGANIZATIONS: {
    label: 'Organizations',
    pathname: 'organizations',
    isEnabled: false,
  },
} as const satisfies Record<string, AccountView>
const ENABLED_ACCOUNT_VIEWS = Object.values(ACCOUNT_VIEW).filter(
  (view) => view.isEnabled,
)

function AccountNav() {
  return (
    <div className="flex flex-row flex-wrap items-center justify-between gap-2">
      <BackButton />
      <Tabs>
        <TabsList>
          {ENABLED_ACCOUNT_VIEWS.map((view) => (
            <Link
              key={view.pathname}
              to="/account/$pathname"
              params={{ pathname: view.pathname }}
              replace={true}
              activeProps={{ className: 'bg-background text-foreground' }}
              className="label flex h-full min-w-24 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1"
            >
              {view.label}
            </Link>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
