import React from 'react'
import type { ShareAuth } from '@/lib/types/validation-schema'
import { ERROR } from '@/lib/errors'

export type CreditPageContextValue = {
  shareAuth: ShareAuth
  eventId: string
}

const CreditPageContext = React.createContext<
  CreditPageContextValue | undefined
>(undefined)

export function CreditPageProvider({
  shareAuth,
  eventId,
  children,
}: CreditPageContextValue & { children: React.ReactNode }) {
  const value = React.useMemo(
    () => ({ shareAuth, eventId }),
    [shareAuth, eventId],
  )
  return (
    <CreditPageContext.Provider value={value}>
      {children}
    </CreditPageContext.Provider>
  )
}

export function useCreditPageContext(): CreditPageContextValue {
  const ctx = React.useContext(CreditPageContext)
  if (ctx === undefined) {
    throw ERROR.INVALID_STATE(
      'useCreditPage must be used within CreditPageProvider',
    )
  }
  return ctx
}
