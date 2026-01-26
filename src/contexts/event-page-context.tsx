import React from 'react'
import type { ShareAuth } from '@/lib/types/validation-schema'
import { ERROR } from '@/lib/errors'

export type EventPageContextValue = {
  shareAuth: ShareAuth
  eventId: string
}

const EventPageContext = React.createContext<EventPageContextValue | undefined>(
  undefined,
)

export function EventPageProvider({
  shareAuth,
  eventId,
  children,
}: EventPageContextValue & { children: React.ReactNode }) {
  const value = React.useMemo(
    () => ({ shareAuth, eventId }),
    [shareAuth, eventId],
  )
  return (
    <EventPageContext.Provider value={value}>
      {children}
    </EventPageContext.Provider>
  )
}

export function useEventPage(): EventPageContextValue {
  const ctx = React.useContext(EventPageContext)
  if (ctx === undefined) {
    throw ERROR.INVALID_STATE(
      'useEventPage must be used within EventPageProvider',
    )
  }
  return ctx
}
