import { ERROR } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { isServer } from '@/lib/utils'

type ShareIntroModalDismissedValue = '1' | null

function shareIntroModalDismissed(eventId: string) {
  const key = `shareIntroModalDismissed.v1.${eventId}`
  if (isServer) {
    logger.error(key, { eventId })
    throw ERROR.INVALID_STATE('Cannot access localStorage on server')
  }

  function getValue(): ShareIntroModalDismissedValue {
    const value = window.localStorage.getItem(key)
    if (value === '1') return value
    return null
  }
  function setValue(value: ShareIntroModalDismissedValue) {
    if (value !== '1') return
    window.localStorage.setItem(key, value)
  }

  return { getValue, setValue }
}

export { shareIntroModalDismissed }
