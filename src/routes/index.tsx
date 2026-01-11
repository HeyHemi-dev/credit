import { createFileRoute } from '@tanstack/react-router'
import {
  SignedIn,
  UserButton,
  RedirectToSignIn,
} from '@neondatabase/neon-js/auth/react/ui'

import { Section } from '@/components/ui/section'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <>
      <SignedIn>
        <Section className="">
          <div className="flex flex-col ">
            <h1>Welcome!</h1>
            <p>You're successfully authenticated.</p>
          </div>
        </Section>
      </SignedIn>
      <RedirectToSignIn />
    </>
  )
}
