import * as React from 'react'
import { Debouncer } from '@tanstack/pacer'
import { Link } from '@tanstack/react-router'
import type { SupplierSearchResult } from '@/lib/types/front-end'
import { useSupplierSearch } from '@/hooks/use-suppliers'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'

type SupplierSearchComboboxProps = {
  eventId: string
  onSupplierSelect: (supplier: SupplierSearchResult) => void
}

export function SupplierSearchCombobox({
  eventId,
  onSupplierSelect,
}: SupplierSearchComboboxProps) {
  const [searchValue, setSearchValue] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [selectedValue, setSelectedValue] =
    React.useState<SupplierSearchResult | null>(null)

  const debouncerRef = React.useRef<Debouncer<(value: string) => void> | null>(
    null,
  )
  if (!debouncerRef.current) {
    debouncerRef.current = new Debouncer(
      (value: string) => {
        setDebouncedSearch(value)
      },
      { wait: 300 },
    )
  }

  const { searchQuery } = useSupplierSearch(eventId, debouncedSearch)
  const searchResults = searchQuery.data ?? []
  const trimmedSearchValue = searchValue.trim()

  const items = React.useMemo(() => {
    if (
      !selectedValue ||
      searchResults.some((supplier) => supplier.id === selectedValue.id)
    ) {
      return searchResults
    }

    return [...searchResults, selectedValue]
  }, [searchResults, selectedValue])

  const statusMessage = React.useMemo(() => {
    if (searchQuery.isFetching) {
      return 'Searching…'
    }
    if (searchQuery.isError) {
      return 'Failed to search. Please try again.'
    }
    if (trimmedSearchValue === '') {
      return selectedValue ? null : 'Start typing to search suppliers…'
    }
    if (searchResults.length === 0) {
      return `No matches for "${trimmedSearchValue}".`
    }
    return null
  }, [
    searchQuery.isError,
    searchQuery.isFetching,
    searchResults.length,
    selectedValue,
    trimmedSearchValue,
  ])

  return (
    <Combobox
      items={items}
      itemToStringLabel={(supplier) => supplier.name}
      filter={null}
      onValueChange={(nextValue) => {
        setSelectedValue(nextValue)
        setSearchValue('')
        setDebouncedSearch('')
        if (nextValue) onSupplierSelect(nextValue)
      }}
      onInputValueChange={(nextValue, { reason }) => {
        setSearchValue(nextValue)
        if (reason === 'item-press') return
        debouncerRef.current?.maybeExecute(nextValue)
      }}
    >
      <ComboboxInput
        placeholder="Search suppliers by name, email, Instagram, TikTok..."
        showClear={!!searchValue}
        value={searchValue}
      />
      <ComboboxContent>
        {statusMessage ? (
          <div className="text-muted-foreground px-3 py-2 text-sm">
            {statusMessage}
          </div>
        ) : null}
        {searchQuery.isFetching && searchResults.length === 0 ? (
          <div className="p-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-1 px-3 py-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            ))}
          </div>
        ) : null}
        <ComboboxList>
          {(supplier: SupplierSearchResult) => (
            <ComboboxItem key={supplier.id} value={supplier}>
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{supplier.name}</span>
                  {supplier.region ? (
                    <span className="text-xs text-muted-foreground">
                      {supplier.region}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{supplier.email}</span>
                  {supplier.instagramHandle ? (
                    <span>@{supplier.instagramHandle}</span>
                  ) : null}
                </div>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
        {searchResults.length > 0 && !searchQuery.isFetching ? (
          <div className="border-t px-3 py-2">
            <Link
              to="/create-supplier"
              search={{ eventId }}
              className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground"
            >
              Create a new supplier
            </Link>
          </div>
        ) : null}
        <ComboboxEmpty>
          {trimmedSearchValue && !searchQuery.isFetching ? (
            <Link
              to="/create-supplier"
              search={{ eventId }}
              className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground"
            >
              Create a new supplier
            </Link>
          ) : null}
        </ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  )
}
