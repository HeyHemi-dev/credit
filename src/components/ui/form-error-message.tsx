import { Alert02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export function FormErrorMessage({ message }: { message: string }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-2 rounded-2xl bg-destructive/5 p-4 text-destructive ring-1 ring-destructive/10">
      <HugeiconsIcon icon={Alert02Icon} className="size-4" />
      <span>{message}</span>
    </div>
  )
}
