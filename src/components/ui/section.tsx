import * as React from 'react'

import { cn } from '@/lib/utils'

function Main({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <main
      className={cn(
        'flex flex-col overflow-x-clip gap-4 py-4 rounded-4xl bg-background',
        className,
      )}
      {...props}
    >
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
      className={cn('grid gap-y-12 px-4 content-start ', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Main, Section }
