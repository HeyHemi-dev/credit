import { cn } from '@/lib/utils'

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
