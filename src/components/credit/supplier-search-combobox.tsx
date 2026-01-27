import * as React from 'react'
import { Link } from '@tanstack/react-router'
import type { Supplier } from '@/lib/types/front-end'
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
  shareToken?: string
  handleChange: (supplierId: string) => void
  containerRef?: React.RefObject<HTMLDivElement | null>
}

export function SupplierSearchCombobox({
  eventId,
  shareToken,
  handleChange,
  containerRef,
}: SupplierSearchComboboxProps) {
  const [userInput, setUserInput] = React.useState('')
  const [selectedSupplier, setSelectedSupplier] =
    React.useState<Supplier | null>(null)
  const { searchQuery, setSearchTerm, isPending } = useSupplierSearch(eventId)

  // ensure selected supplier is always in the list of results, even after a new search is performed
  const searchResults = React.useMemo(() => {
    const results = searchQuery.data ?? []
    if (
      !selectedSupplier ||
      results.some((supplier) => supplier.id === selectedSupplier.id)
    ) {
      return results
    }
    return [selectedSupplier, ...results]
  }, [searchQuery.data, selectedSupplier])

  const statusMessage = React.useMemo(() => {
    if (isPending) return 'Searching...'
    if (searchQuery.isError) return 'Something went wrong. Please try again.'
    if (userInput === '')
      return 'Start typing to search. You can create a new supplier if needed.'
  }, [searchQuery.isError, userInput, isPending])

  return (
    <Combobox
      items={searchResults}
      itemToStringLabel={(supplier: Supplier) => supplier.name}
      filter={null}
      onValueChange={(nextValue) => {
        setUserInput(nextValue?.name ?? '')
        handleChange(nextValue?.id ?? '')
        setSelectedSupplier(nextValue)
      }}
      onInputValueChange={(nextValue, { reason }) => {
        // If the user presses an item, we don't want to update the search term.
        if (reason === 'item-press') return
        setUserInput(nextValue)
        setSearchTerm(nextValue)

        // If the user clears the input, use handleChange to clear form's field state.
        if (nextValue === '' && userInput !== '') handleChange('')
      }}
    >
      <ComboboxInput
        placeholder="Search suppliers..."
        showClear={!!userInput}
        value={userInput}
      />
      <ComboboxContent containerRef={containerRef} className="grid gap-2 p-2">
        <ComboboxList>
          {(supplier: Supplier) => (
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
        <ComboboxStatus className="text-sm text-muted-foreground">
          {statusMessage}
        </ComboboxStatus>

        {userInput !== '' && !searchQuery.isFetching && (
          <>
            <ComboboxSeparator />
            <div className="flex gap-2 px-3 py-2 text-sm text-muted-foreground">
              <span>Not found?</span>
              <Link
                to="/create-supplier"
                search={{ shareToken }}
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
