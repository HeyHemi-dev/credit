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
        'grid grow content-start gap-y-20 overflow-clip rounded-4xl bg-background p-6',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function SectionHeader({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('grid content-start gap-y-20 p-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}

function SectionContent({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('grid content-start gap-y-20 px-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}

function SectionFooter({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('grid content-start gap-y-20 p-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}

// TODO: Section header, content, and footer components

export { Main, Section, SectionHeader, SectionContent, SectionFooter }
