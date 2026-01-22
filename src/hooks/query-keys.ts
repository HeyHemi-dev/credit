/**
 * common query keys for the app
 */
const queryKeys = {
  events: (userId: string) => ['events', userId] as const,
  event: (eventId: string) => ['event', eventId] as const,
  eventSuppliers: (eventId: string) => ['eventSuppliers', eventId] as const,
  // coupleEvent: (shareToken: string) => ['coupleEvent', shareToken] as const,
  supplierSearch: (eventId: string, query: string) =>
    ['supplierSearch', eventId, query] as const,
  supplierDedupe: (email: string, name: string) =>
    ['supplierDedupe', email, name] as const,
}

export { queryKeys }
