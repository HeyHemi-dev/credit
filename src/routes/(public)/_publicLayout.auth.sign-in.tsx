import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(public)/_publicLayout/auth/sign-in')({
  beforeLoad: () => {
    throw redirect({ to: '/auth/sign-up' })
  },
  component: () => null,
})
