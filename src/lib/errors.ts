import type { ConstEnum } from './generic-types'

export const ERROR_MESSAGE = {
  // Authentication errors (401)
  NOT_AUTHENTICATED: 'Authentication required',

  // Authorization errors (403)
  FORBIDDEN: 'Insufficient permissions',

  // Validation errors (400)
  VALIDATION_ERROR: 'Invalid data',
  INVALID_INPUT: 'Invalid input',

  // Business logic errors (400)
  BUSINESS_RULE_VIOLATION: 'Business logic error',
  RESOURCE_CONFLICT: 'Resource conflict',
  INVALID_STATE: 'Invalid state',

  // Resource errors (404)
  RESOURCE_NOT_FOUND: 'Resource not found',

  // Server errors (500)
  INTERNAL_SERVER_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database operation failed',
  NETWORK_ERROR: 'Network error',
  UNKNOWN_ERROR: 'Unknown error',
} as const satisfies ConstEnum

export type ErrorMessage = (typeof ERROR_MESSAGE)[keyof typeof ERROR_MESSAGE]

export const ERROR = {
  NOT_AUTHENTICATED: (message?: string) =>
    new Error(message ?? ERROR_MESSAGE.NOT_AUTHENTICATED, {
      cause: ERROR_MESSAGE.NOT_AUTHENTICATED,
    }),

  FORBIDDEN: (message?: string) =>
    new Error(message ?? ERROR_MESSAGE.FORBIDDEN, {
      cause: ERROR_MESSAGE.FORBIDDEN,
    }),

  VALIDATION_ERROR: (message?: string) =>
    new Error(message ?? ERROR_MESSAGE.VALIDATION_ERROR, {
      cause: ERROR_MESSAGE.VALIDATION_ERROR,
    }),

  BUSINESS_RULE_VIOLATION: (message?: string) =>
    new Error(message ?? ERROR_MESSAGE.BUSINESS_RULE_VIOLATION, {
      cause: ERROR_MESSAGE.BUSINESS_RULE_VIOLATION,
    }),

  RESOURCE_CONFLICT: (message?: string) =>
    new Error(message ?? ERROR_MESSAGE.RESOURCE_CONFLICT, {
      cause: ERROR_MESSAGE.RESOURCE_CONFLICT,
    }),

  INVALID_STATE: (message?: string) =>
    new Error(message ?? ERROR_MESSAGE.INVALID_STATE, {
      cause: ERROR_MESSAGE.INVALID_STATE,
    }),

  RESOURCE_NOT_FOUND: (message?: string) =>
    new Error(message ?? ERROR_MESSAGE.RESOURCE_NOT_FOUND, {
      cause: ERROR_MESSAGE.RESOURCE_NOT_FOUND,
    }),

  INTERNAL_SERVER_ERROR: (message?: string) =>
    new Error(message ?? ERROR_MESSAGE.INTERNAL_SERVER_ERROR, {
      cause: ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
    }),

  DATABASE_ERROR: (message?: string) =>
    new Error(message ?? ERROR_MESSAGE.DATABASE_ERROR, {
      cause: ERROR_MESSAGE.DATABASE_ERROR,
    }),

  NETWORK_ERROR: (message?: string) =>
    new Error(message ?? ERROR_MESSAGE.NETWORK_ERROR, {
      cause: ERROR_MESSAGE.NETWORK_ERROR,
    }),

  UNKNOWN_ERROR: (message?: string) =>
    new Error(message ?? ERROR_MESSAGE.UNKNOWN_ERROR, {
      cause: ERROR_MESSAGE.UNKNOWN_ERROR,
    }),
} as const
