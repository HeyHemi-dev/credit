import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkSquare02Icon, Copy01Icon } from '@hugeicons/core-free-icons'
import type { buttonVariants } from '@/components/ui/button'
import type { VariantProps } from 'class-variance-authority'
import type { Button as ButtonPrimitive } from '@base-ui/react/button'
import type { IconSVGObject } from '@/lib/types/generic-types'
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

/**
 * @deprecated prefer ActionButton instead.
 */
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

// TODO: replace copy and submit buttons with action button

type ActionButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    labels: {
      idle: string
      acting: string
    }
    icons: {
      idle: IconSVGObject | null
      acting: IconSVGObject | null
    }
    iconSide: 'left' | 'right'
    isActing: boolean
    className?: string
    classNames?: {
      button?: string
      idle?: string
      idleIcon?: string
      acting?: string
      actingIcon?: string
    }
    disabled?: boolean
  }

/**
 * Buttons with an idle and acting state. Useful for showing a loading state.
 * Uses opacity to show the idle or acting state, so that button width is stable between states.
 *
 * A11y:
 * - Uses aria-label so the accessible name always matches the visible state.
 * - Hides the visual label spans from assistive tech (prevents double-announcement).
 * - Marks busy state with aria-busy.
 * - Icons are decorative (aria-hidden).
 * - Respects reduced motion.
 */
export function ActionButton({
  labels,
  icons = {
    idle: null,
    acting: null,
  },
  iconSide = 'left',
  isActing,
  disabled,
  className,
  classNames,
  ...props
}: ActionButtonProps) {
  const isDisabled = Boolean(disabled || isActing)

  return (
    <Button
      {...props}
      disabled={isDisabled}
      aria-busy={isActing || undefined}
      aria-label={isActing ? labels.acting : labels.idle}
      className={cn('grid place-items-center', classNames?.button, className)}
    >
      {/* Idle state (visual only) */}
      <span
        aria-hidden="true"
        className={cn(
          'col-start-1 row-start-1 flex items-center gap-2 opacity-100 transition-opacity duration-300 motion-reduce:transition-none',
          isActing && 'opacity-0',
          classNames?.idle,
        )}
      >
        {labels.idle}
        {icons.idle && (
          <HugeiconsIcon
            icon={icons.idle}
            aria-hidden="true"
            focusable="false"
            className={cn(
              iconSide === 'left' && 'order-first',
              classNames?.idleIcon,
            )}
          />
        )}
      </span>

      {/* Acting state (visual only) */}
      <span
        aria-hidden="true"
        className={cn(
          'col-start-1 row-start-1 flex items-center gap-2 opacity-0 transition-opacity duration-300 motion-reduce:transition-none',
          isActing && 'opacity-100',
          classNames?.acting,
        )}
      >
        {labels.acting}
        {icons.acting && (
          <HugeiconsIcon
            icon={icons.acting}
            aria-hidden="true"
            focusable="false"
            className={cn(
              iconSide === 'left' && 'order-first',
              classNames?.actingIcon,
            )}
          />
        )}
      </span>
    </Button>
  )
}
