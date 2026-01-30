import { Section } from '@/components/ui/section'
import { cn } from '@/lib/utils'

export function HeaderLayout({
  left,
  right,
  classNames,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  classNames?: {
    layout?: string
    left?: string
    right?: string
  }
  left: React.ReactNode
  right: React.ReactNode
}) {
  return (
    <Section
      className={cn(
        'flex flex-wrap items-center justify-between gap-4 bg-transparent py-0',
        className,
        classNames?.layout,
      )}
      {...props}
    >
      <div className={cn('grid justify-start gap-4', classNames?.left)}>
        {left}
      </div>
      <div className={cn('grid justify-end gap-4', classNames?.right)}>
        {right}
      </div>
    </Section>
  )
}

export function Brand({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'text-xs font-semibold tracking-[0.3em] text-foreground/80 uppercase',
        className,
      )}
      {...props}
    >
      With Thanks
    </div>
  )
}
