import React from 'react'
import type { SessionAuth, ShareAuth } from '@/lib/types/validation-schema'
import { ERROR } from '@/lib/errors'
import { isSessionAuthToken, isShareAuthToken } from '@/hooks/use-auth-token'

type CreditContextValue = {
  authToken: SessionAuth | ShareAuth
  eventId: string
}

const CreditContext = React.createContext<CreditContextValue | undefined>(
  undefined,
)

export function CreditProvider({
  authToken,
  eventId,
  children,
}: CreditContextValue & { children: React.ReactNode }) {
  const value = React.useMemo(() => {
    // Either share or session auth tokens are valid for credit operations.
    if (!isShareAuthToken(authToken) && !isSessionAuthToken(authToken)) {
      throw ERROR.NOT_AUTHENTICATED()
    }

    return { authToken, eventId }
  }, [authToken, eventId])
  return (
    <CreditContext.Provider value={value}>{children}</CreditContext.Provider>
  )
}

export function useCreditContext(): CreditContextValue {
  const ctx = React.useContext(CreditContext)
  if (ctx === undefined) {
    throw ERROR.INVALID_STATE(
      'useCreditContext must be used within CreditProvider',
    )
  }
  return ctx
}
