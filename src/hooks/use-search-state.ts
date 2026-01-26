import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'

type RouteLike<TSearch extends Record<string, any>> = {
  id: string
  useSearch: () => TSearch
}

export function createUseRouteSearchState<TSearch extends Record<string, any>>(
  route: RouteLike<TSearch>,
) {
  return function useRouteSearchState<K extends keyof TSearch>(
    key: K,
  ): [
    TSearch[K],
    (next: TSearch[K] | ((prev: TSearch[K]) => TSearch[K])) => void,
  ] {
    const navigate = useNavigate()
    const search = route.useSearch()
    const value = search[key]

    const setValue = React.useCallback(
      (next: TSearch[K] | ((prev: TSearch[K]) => TSearch[K])) => {
        const resolved =
          typeof next === 'function' ? (next as any)(value) : next

        navigate({
          to: '.',
          replace: true,
          search: (prev: any) => ({ ...prev, [key]: resolved }),
        })
      },
      [navigate, key, value],
    )

    return [value, setValue]
  }
}
