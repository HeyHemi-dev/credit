import { AccountView } from '@daveyplate/better-auth-ui'
import { AuthUiShell } from '@/components/auth/auth-ui-shell.client'

type AccountViewClientProps = {
  pathname: string
}

export function AccountViewClient({ pathname }: AccountViewClientProps) {
  return (
    <AuthUiShell>
      <AccountView
        pathname={pathname}
        classNames={{
          base: 'grid gap-4 content-start !w-auto',
          sidebar: { base: 'flex flex-row justify-center !w-auto' },
        }}
        hideNav={true}
      />
    </AuthUiShell>
  )
}
