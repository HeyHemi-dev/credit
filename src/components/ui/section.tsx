import * as React from 'react'
import { cn } from '@/lib/utils'

type MainProps = {
  children: React.ReactNode
  header?: React.ReactNode | null
  footer?: React.ReactNode | null
}

function Main({ children, header = null, footer = null }: MainProps) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,32rem)_auto] text-foreground">
      <div
        className={cn(
          'col-start-2 col-end-2 grid min-h-screen p-1',
          header && !footer && 'grid-rows-[auto_1fr]',
          !header && footer && 'grid-rows-[1fr_auto]',
          header && footer && 'grid-rows-[auto_1fr_auto]',
        )}
      >
        {header && <header className="py-4">{header}</header>}
        <main className="flex flex-col gap-4">{children}</main>
        {footer && <footer className="py-4">{footer}</footer>}
      </div>
    </div>
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
