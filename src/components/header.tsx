import { SectionContent } from '@/components/ui/section'
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
    <SectionContent
      className={cn(
        'flex flex-wrap items-center justify-between gap-4 bg-transparent py-0',
        className,
        classNames?.layout,
      )}
      {...props}
    >
      <div className={cn('grid gap-4', classNames?.left)}>{left}</div>
      <div className={cn('grid gap-4', classNames?.right)}>{right}</div>
    </SectionContent>
  )
}

export function Brand({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'text-xs font-semibold tracking-[0.3em] uppercase opacity-80',
        className,
      )}
      {...props}
    >
      With Thanks
    </div>
  )
}
