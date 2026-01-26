import React from 'react'
import type { ShareAuth } from '@/lib/types/validation-schema'
import { ERROR } from '@/lib/errors'

export type EventCreditPageContextValue = {
  shareAuth: ShareAuth
  eventId: string
}

const EventCreditPageContext = React.createContext<
  EventCreditPageContextValue | undefined
>(undefined)

export function EventCreditPageProvider({
  shareAuth,
  eventId,
  children,
}: EventCreditPageContextValue & { children: React.ReactNode }) {
  const value = React.useMemo(
    () => ({ shareAuth, eventId }),
    [shareAuth, eventId],
  )
  return (
    <EventCreditPageContext.Provider value={value}>
      {children}
    </EventCreditPageContext.Provider>
  )
}

export function useEventCreditPage(): EventCreditPageContextValue {
  const ctx = React.useContext(EventCreditPageContext)
  if (ctx === undefined) {
    throw ERROR.INVALID_STATE(
      'useEventCreditPage must be used within EventCreditPageProvider',
    )
  }
  return ctx
}
