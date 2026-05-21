/**
 * common query keys for the app
 */
const queryKeys = {
  events: (userId: string) => ['events', userId] as const,
  event: (eventId: string) => ['event', eventId] as const,
  eventSuppliers: (eventId: string) => ['eventSuppliers', eventId] as const,
  supplier: (supplierId: string) => ['supplier', supplierId] as const,
  supplierSearch: (eventId: string, query: string) =>
    ['supplierSearch', eventId, query] as const,
  supplierClaim: () => ['supplierClaim'] as const,
  supplierClaimSearch: (query: string) =>
    ['supplierClaimSearch', query] as const,
  supplierDedupe: (email: string, name: string) =>
    ['supplierDedupe', email, name] as const,
}

export { queryKeys }
