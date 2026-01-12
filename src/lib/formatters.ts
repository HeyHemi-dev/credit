import type { Service } from '@/lib/constants'
import { CREDIT_OUTPUT, SERVICES } from '@/lib/constants'

export type CreditSupplier = {
  name: string
  email: string
  instagramHandle: string | null
  service: Service
}

export function formatInstagramCredits(items: Array<CreditSupplier>): string {
  const serviceOrder = new Map(SERVICES.map((s, i) => [s, i]))

  const sorted = [...items].sort((a, b) => {
    const aIdx = serviceOrder.get(a.service) ?? 999
    const bIdx = serviceOrder.get(b.service) ?? 999
    if (aIdx !== bIdx) return aIdx - bIdx
    return a.name.localeCompare(b.name)
  })

  return sorted
    .map((i) => {
      const value = i.instagramHandle
        ? `${CREDIT_OUTPUT.INSTAGRAM.VALUE_PREFIX}${i.instagramHandle}`
        : i.name
      return CREDIT_OUTPUT.INSTAGRAM.LINE_TEMPLATE.replace(
        '[service]',
        i.service,
      ).replace('[value]', value)
    })
    .join(CREDIT_OUTPUT.INSTAGRAM.LINE_SEPARATOR)
}

export function formatEmailList(
  items: Array<Pick<CreditSupplier, 'email'>>,
): string {
  return items.map((i) => i.email).join(CREDIT_OUTPUT.EMAIL.SEPARATOR)
}
