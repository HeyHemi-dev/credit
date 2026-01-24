import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, Loading02Icon } from '@hugeicons/core-free-icons'

export function AuthState({
  isPending,
  message,
}: {
  isPending: boolean
  message: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border p-6 text-muted-foreground">
      {isPending ? (
        <HugeiconsIcon icon={Loading02Icon} className="animate-spin" />
      ) : (
        <HugeiconsIcon icon={Alert02Icon} />
      )}
      <p className="text-sm">{message}</p>
    </div>
  )
}
