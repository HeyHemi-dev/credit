import { SignedIn, UserButton } from '@neondatabase/neon-js/auth/react/ui'
import { Section } from '@/components/ui/section'

export function Header() {
  return (
    <Section>
      <div className="grid grid-cols-[1fr_auto] gap-4 items-center content-center">
        <p id="brand" className="font-bold uppercase tracking-wide">
          Give Credit
        </p>
        <SignedIn>
          <UserButton variant={'ghost'} size={'icon'} />
        </SignedIn>
      </div>
    </Section>
  )
}
