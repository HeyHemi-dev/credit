import { AuthQueryProvider } from '@daveyplate/better-auth-tanstack'
import { AuthUIProviderTanstack } from '@daveyplate/better-auth-ui/tanstack'
import React from 'react'
import betterAuthCss from '@daveyplate/better-auth-ui/css?url'
import { authClient } from '@/auth'
import { AUTH_REDIRECT_PATH } from '@/lib/auth-constants'

export function AuthUiShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthQueryProvider>
      <BetterAuthStylesheet />
      <AuthUIProviderTanstack
        authClient={authClient}
        social={{ providers: ['google'] }}
        credentials={false}
        organization={false}
        redirectTo={AUTH_REDIRECT_PATH}
        teams={false}
      >
        {children}
      </AuthUIProviderTanstack>
    </AuthQueryProvider>
  )
}

function BetterAuthStylesheet() {
  React.useEffect(() => {
    const linkId = 'better-auth-ui-css'
    if (document.getElementById(linkId)) return

    const link = document.createElement('link')
    link.id = linkId
    link.rel = 'stylesheet'
    link.href = betterAuthCss
    document.head.append(link)
  }, [])

  return null
}
