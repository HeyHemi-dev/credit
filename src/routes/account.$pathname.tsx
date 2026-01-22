import { createFileRoute } from '@tanstack/react-router'
import { AccountView } from '@neondatabase/neon-js/auth/react/ui'
import { Main, Section } from '@/components/ui/section'
import { BackButton } from '@/components/back-button'

export const Route = createFileRoute('/account/$pathname')({
  component: Account,
})

function Account() {
  const { pathname } = Route.useParams()
  return (
    <Main>
      <Section>
        <BackButton />
        <AccountView
          pathname={pathname}
          classNames={{
            base: 'grid gap-4 content-start !w-auto',
            sidebar: { base: 'flex flex-row justify-center !w-auto' },
          }}
          hideNav={false}
        />
      </Section>
    </Main>
  )
}
