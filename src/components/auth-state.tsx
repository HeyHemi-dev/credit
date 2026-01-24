import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, Loading02Icon } from '@hugeicons/core-free-icons'
import type { ComponentProps } from 'react'
import type { AuthStatus } from '@/lib/constants'
import type { AuthToken } from '@/lib/types/validation-schema'
import { AUTH_STATUS } from '@/lib/constants'
import { cn } from '@/lib/utils'

type IconSVGObject = ComponentProps<typeof HugeiconsIcon>['icon']
type AuthStateProps = {
  authToken: AuthToken
  messages?: {
    [key in AuthStatus]?: string
  }
  icons?: {
    [key in AuthStatus]?: IconSVGObject
  }
}

export function AuthState({
  authToken,
  messages = {
    pending: 'Checking authentication...',
    unauthenticated:
      'Not authenticated. Please log in, or request a new share link',
  },
  icons = {
    pending: Loading02Icon,
    unauthenticated: Alert02Icon,
  },
}: AuthStateProps) {
  if (authToken.status === AUTH_STATUS.AUTHENTICATED) return null

  const icon = icons[authToken.status] ?? Alert02Icon

  return (
    <div className="flex items-center gap-2 rounded-xl border p-6 text-muted-foreground">
      <HugeiconsIcon
        icon={icon}
        className={cn(
          authToken.status === AUTH_STATUS.PENDING && 'animate-spin',
        )}
      />
      <p className="text-sm">{messages[authToken.status]}</p>
    </div>
  )
}
