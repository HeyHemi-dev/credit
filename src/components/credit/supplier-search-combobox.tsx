import * as React from 'react'
import { useDebouncedState } from '@tanstack/react-pacer'
import { Link } from '@tanstack/react-router'
import type { SupplierSearchResult } from '@/lib/types/front-end'
import { useSupplierSearch } from '@/hooks/use-suppliers'
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxStatus,
} from '@/components/ui/combobox'

type SupplierSearchComboboxProps = {
  eventId: string
  handleChange: (supplierId: string) => void
  containerRef?: React.RefObject<HTMLDivElement | null>
}

export function SupplierSearchCombobox({
  eventId,
  handleChange,
  containerRef,
}: SupplierSearchComboboxProps) {
  const [userInput, setUserInput] = React.useState('')
  const [searchTerm, setSearchTerm, debouncer] = useDebouncedState(
    '',
    {
      wait: 300,
    },
    (state) => ({ isPending: state.isPending }),
  )
  const { searchQuery } = useSupplierSearch(eventId, searchTerm)
  // ensure selected supplier is always in the list of results, even after a new search is performed
  const [selectedSupplier, setSelectedSupplier] =
    React.useState<SupplierSearchResult | null>(null)
  const searchResults = React.useMemo(() => {
    const results = searchQuery.data ?? []
    if (
      !selectedSupplier ||
      results.some((supplier) => supplier.id === selectedSupplier.id)
    )
      return results
    return [selectedSupplier, ...results]
  }, [searchQuery.data, selectedSupplier])

  const statusMessage = React.useMemo(() => {
    if (searchQuery.isFetching || debouncer.state.isPending)
      return 'Searching...'
    if (searchQuery.isError) return 'Search failed. Please try again.'
    if (searchTerm === '') return 'Start typing to search...'
  }, [
    searchQuery.isFetching,
    searchQuery.isError,
    searchTerm,
    debouncer.state.isPending,
  ])

  return (
    <Combobox
      items={searchResults}
      itemToStringLabel={(supplier: SupplierSearchResult) => supplier.name}
      filter={null}
      onValueChange={(nextValue) => {
        setUserInput(nextValue?.name ?? '')
        handleChange(nextValue?.id ?? '')
        setSelectedSupplier(nextValue)
      }}
      onInputValueChange={(nextValue, { reason }) => {
        // If the user presses an item, we don't want to update the search term.
        if (reason === 'item-press') return
        const trimmedValue = nextValue.trim()
        setUserInput(trimmedValue)
        setSearchTerm(trimmedValue)

        // If the user clears the input, use handleChange to clear form's field state.
        if (trimmedValue === '' && userInput !== '') handleChange('')
      }}
    >
      <ComboboxInput
        placeholder="Search suppliers..."
        showClear={!!userInput}
        value={userInput}
      />
      <ComboboxContent containerRef={containerRef} className="grid gap-2 p-2">
        <ComboboxList>
          {(supplier: SupplierSearchResult) => (
            <ComboboxItem key={supplier.id} value={supplier}>
              <p className="flex gap-2">
                <span>{supplier.name}</span>
                {supplier.region && (
                  <span className="text-muted-foreground">
                    {supplier.region}
                  </span>
                )}
              </p>
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxStatus className="text-muted-foreground text-sm">
          {statusMessage}
        </ComboboxStatus>

        {userInput !== '' && !searchQuery.isFetching && (
          <>
            <ComboboxSeparator />
            <div className="text-muted-foreground text-sm px-3 py-2 flex gap-2">
              <span>Not found?</span>
              <Link
                to="/create-supplier"
                search={{ eventId }}
                className="underline underline-offset-4 hover:text-foreground"
              >
                Create a new supplier
              </Link>
            </div>
          </>
        )}
      </ComboboxContent>
    </Combobox>
  )
}
// function displaySearchStatusMessage(
//   query: UseQueryResult<Array<SupplierSearchResult>>,
//   searchTerm: string,
// ) {
//   if (query.isFetching) {
//     return 'Searching…'
//   }
//   if (query.isError) {
//     return 'Failed to search. Please try again.'
//   }
//   if (searchTerm.trim() === '') {
//     return 'Start typing to search suppliers…'
//   }
//   if (query.data && query.data.length === 0) {
//     return `No matches for "${searchTerm}".`
//   }
//   return null
// }
