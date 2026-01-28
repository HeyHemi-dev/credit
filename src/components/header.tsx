import { SignedIn, UserButton } from '@neondatabase/neon-js/auth/react/ui'
import { Section } from '@/components/ui/section'
import { cn } from '@/lib/utils'

export function Header() {
  return (
    <Section className="bg-transparent py-0">
      <div className="grid grid-cols-[1fr_auto] content-center items-center gap-4">
        <Brand id="brand" />
        <SignedIn>
          <UserButton
            variant={'ghost'}
            size={'icon'}
            classNames={{
              trigger: {
                avatar: {
                  fallback:
                    'bg-primary/60 text-primary-foreground w-full h-full',
                },
              },
              content: {
                user: {
                  avatar: {
                    fallback:
                      'bg-primary/60 text-primary-foreground w-full h-full',
                  },
                },
              },
            }}
          />
        </SignedIn>
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
