import * as React from 'react'

import { cn } from '@/lib/utils'

function Main({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <main className={cn('flex flex-col gap-4', className)} {...props}>
      {children}
    </main>
  )
}

function Section({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'grid grow content-start gap-y-12 overflow-x-clip rounded-4xl bg-background p-6',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Main, Section }
