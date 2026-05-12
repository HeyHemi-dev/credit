import { Link } from '@tanstack/react-router'
import { LinkSquare02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { SignedIn, SignedOut } from '@daveyplate/better-auth-ui'
import { AuthUiShell } from '@/components/auth/auth-ui-shell.client'
import { PublicStartFreeButton } from '@/components/auth/public-start-free-button'

export function PublicHeaderAuthActionsClient() {
  return (
    <AuthUiShell>
      <SignedIn>
        <Link to="/events">
          <span className="flex items-center gap-2 text-sm">
            Open App
            <HugeiconsIcon icon={LinkSquare02Icon} size="16" />
          </span>
        </Link>
      </SignedIn>
      <SignedOut>
        <PublicStartFreeButton />
      </SignedOut>
    </AuthUiShell>
  )
}
