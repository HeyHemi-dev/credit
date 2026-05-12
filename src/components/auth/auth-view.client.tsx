import { Link } from '@tanstack/react-router'
import { AuthView } from '@daveyplate/better-auth-ui'
import { AuthUiShell } from '@/components/auth/auth-ui-shell.client'

type AuthViewClientProps = {
  pathname: string
}

export function AuthViewClient({ pathname }: AuthViewClientProps) {
  return (
    <AuthUiShell>
      <AuthView
        pathname={pathname}
        localization={{
          SIGN_IN: 'Log in as a wedding supplier',
          SIGN_UP: 'Sign up as a wedding supplier',
        }}
        classNames={{
          base: 'max-w-auto',
          header: 'text-center',
          title: 'text-2xl font-light text-balance',
          description: 'text-sm text-muted-foreground text-pretty',
        }}
        cardFooter={
          <p className="grow text-center text-xs text-balance text-muted-foreground/60">
            By continuing, you agree to our{' '}
            <Link to="/terms" target="_blank">
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link to="/privacy" target="_blank">
              Privacy Policy
            </Link>
          </p>
        }
      />
    </AuthUiShell>
  )
}
