import { Link } from '@tanstack/react-router'
import { BackButton } from '@/components/back-button'
import { Tabs, TabsList } from '@/components/ui/tabs'

export function AccountNav() {
  return (
    <div className="flex flex-row flex-wrap items-center justify-between gap-2">
      <BackButton />
      <Tabs>
        <TabsList>
          <Link
            to="/account/settings"
            replace={true}
            activeProps={{ className: 'bg-background text-foreground' }}
            className="label flex h-full min-w-24 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1"
          >
            Settings
          </Link>
          <Link
            to="/account/security"
            replace={true}
            activeProps={{ className: 'bg-background text-foreground' }}
            className="label flex h-full min-w-24 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1"
          >
            Security
          </Link>
        </TabsList>
      </Tabs>
    </div>
  )
}
