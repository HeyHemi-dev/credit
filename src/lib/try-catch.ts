// Types for the result object with discriminated union
type Success<T> = {
  data: T
  error: null
}

type Failure<E> = {
  data: null
  error: E
}

type Result<T, E = Error> = Success<T> | Failure<E>

// Export Result type for use in other files
export type { Result }

// Main wrapper function

/**
 * Wraps a promise and returns a typed result
 * Encourages explicit error handling by returning a result object instead of throwing.
 * @returns data (promise result) with type T and error as null, OR
 * @returns data as null and error with type E
 *
 */
export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    const data = await promise
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as E }
  }
}

/**
 * Wraps a synchronous function and returns a typed result.
 * Encourages explicit error handling by returning a result object instead of throwing.
 * @returns data (function result) with type T and error as null, OR
 * @returns data as null and error with type E
 *
 */
export function tryCatchSync<T, E = Error>(fn: () => T): Result<T, E> {
  try {
    const data = fn()
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as E }
  }
}
