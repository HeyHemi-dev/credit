const queryKeys = {
  events: (userId: string) => ['events', userId] as const,
  eventSuppliers: (eventId: string) => ['eventSuppliers', eventId] as const,
  coupleEvent: (shareToken: string) => ['coupleEvent', shareToken] as const,
  supplierSearch: (shareToken: string, query: string) =>
    ['supplierSearch', shareToken, query] as const,
  supplierDedupe: (shareToken: string, name: string, email: string) =>
    ['supplierDedupe', shareToken, name, email] as const,
}

export default queryKeys
