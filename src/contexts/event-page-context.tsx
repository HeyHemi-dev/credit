import React from 'react'
import type { AuthToken } from '@/lib/types/validation-schema'
import type { AUTH_STATUS, AUTH_TOKEN_TYPE } from '@/lib/constants'
import { ERROR } from '@/lib/errors'

export type ShareAuthToken = Extract<
  AuthToken,
  {
    status: typeof AUTH_STATUS.AUTHENTICATED
    tokenType: typeof AUTH_TOKEN_TYPE.SHARE_TOKEN
  }
>

export type EventPageContextValue = {
  shareAuth: ShareAuthToken
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
    throw ERROR.INVALID_STATE('useEventPage must be used within EventPageProvider')
  }
  return ctx
}
