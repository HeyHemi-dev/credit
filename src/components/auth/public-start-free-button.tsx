import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function PublicStartFreeButton() {
  return (
    <Button
      variant="default"
      className="min-w-[9em] justify-self-start bg-linear-to-br from-primary to-harakeke-500 shadow-xl shadow-primary/20"
      render={(props) => (
        <Link
          to="/auth/$pathname"
          params={{ pathname: 'sign-up' }}
          className={props.className}
        >
          Start Free
        </Link>
      )}
    />
  )
}
