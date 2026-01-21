import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'

import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'

export function BackButton() {
  const handleBack = useBack()

  return (
    <Button
      variant="secondary"
      onClick={handleBack}
      className="flex items-center gap-2"
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} />
      <span className="text-xs font-normal uppercase">Back</span>
    </Button>
  )
}

export function useBack() {
  const navigate = useNavigate()
  const route = useRouter()
  const canGoBack = useCanGoBack()

  function handleBack() {
    if (canGoBack) {
      route.history.back()
    } else {
      navigate({ to: '/' })
    }
  }

  return handleBack
}
