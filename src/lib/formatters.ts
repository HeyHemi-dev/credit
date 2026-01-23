import type { Credit } from '@/lib/types/front-end'
import { SERVICES } from '@/lib/constants'

export function formatInstagramCredits(items: Array<Credit>): string {
  const serviceOrder = new Map(SERVICES.map((s, i) => [s, i]))

  const sorted = [...items].sort((a, b) => {
    const aIdx = serviceOrder.get(a.service) ?? 999
    const bIdx = serviceOrder.get(b.service) ?? 999
    if (aIdx !== bIdx) return aIdx - bIdx
    return a.name.localeCompare(b.name)
  })

  return sorted
    .map((item) => {
      const value = item.instagramHandle
        ? `@${item.instagramHandle}`
        : item.name
      return `${item.service} - ${value}`
    })
    .join('\n')
}

export function formatEmailList(items: Array<Pick<Credit, 'email'>>): string {
  return items.map((item) => item.email).join(', ')
}

// ================================
// db normalization helpers
// ================================

export function normalizeHandle(input: string): string {
  return input.trim().replace(/^@+/, '').toLowerCase()
}

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase()
}
