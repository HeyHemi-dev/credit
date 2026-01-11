import * as React from 'react'

import { cn } from '@/lib/utils'

function Section({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('grid gap-y-12 px-4 content-start', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Section }
