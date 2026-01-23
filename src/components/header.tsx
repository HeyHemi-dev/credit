import { SignedIn, UserButton } from '@neondatabase/neon-js/auth/react/ui'
import { Section } from '@/components/ui/section'

export function Header() {
  return (
    <Section className="bg-transparent py-0">
      <div className="grid grid-cols-[1fr_auto] content-center items-center gap-4">
        <p id="brand" className="font-bold tracking-wide uppercase">
          Give Credit
        </p>
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
