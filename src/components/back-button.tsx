import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'

export function BackButton() {
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

  return (
    <Button variant="outline" size="icon" onClick={handleBack}>
      <HugeiconsIcon icon={ArrowLeft01Icon} />
      <span>Back</span>
    </Button>
  )
}
