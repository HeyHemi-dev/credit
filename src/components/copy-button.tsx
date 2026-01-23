import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkSquare02Icon, Copy01Icon } from '@hugeicons/core-free-icons'
import type { buttonVariants } from '@/components/ui/button'
import type { VariantProps } from 'class-variance-authority'
import type { Button as ButtonPrimitive } from '@base-ui/react/button'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CopyButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    labels: {
      idle: string
      copied: string
    }
    isCopied: boolean
    className?: string
    disabled?: boolean
  }

export function CopyButton({
  labels,
  isCopied,
  disabled,
  className,
  ...props
}: CopyButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || isCopied}
      className={cn('grid place-items-center', className)}
    >
      <span
        className={cn(
          'col-start-1 row-start-1 flex items-center gap-2 opacity-100 transition-opacity duration-300',
          isCopied && 'opacity-0',
        )}
      >
        <HugeiconsIcon icon={Copy01Icon} />
        {labels.idle}
      </span>
      <span
        className={cn(
          'col-start-1 row-start-1 flex items-center gap-2 opacity-0 transition-opacity duration-300',
          isCopied && 'opacity-100',
        )}
      >
        <HugeiconsIcon icon={CheckmarkSquare02Icon} />
        {labels.copied}
      </span>
    </Button>
  )
}
