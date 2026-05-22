import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import type { Supplier, SupplierClaimSearchResult } from '@/lib/types/front-end'
import { authClient } from '@/auth'
import { claimSupplierSchema } from '@/lib/types/validation-schema'
import { useClaimSupplier, useSupplierClaimSearch } from '@/hooks/use-supplier-claims'
import { FormErrorMessage } from '@/components/suppliers/supplier-claim-shared'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { FieldGroup } from '@/components/ui/field'
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxStatus,
} from '@/components/ui/combobox'

type ClaimSupplierFormValues = {
  supplierId: string
}

const defaultValues: ClaimSupplierFormValues = {
  supplierId: '',
}

export function ClaimSupplierForm({
  initialSupplier,
}: {
  initialSupplier: Supplier | null
}) {
  const { claimMutation } = useClaimSupplier()
  const { data: sessionData } = authClient.useSession()
  const [selectedSupplier, setSelectedSupplier] = React.useState<
    SupplierClaimSearchResult | Supplier | null
  >(initialSupplier)
  const selectedSupplierEmail = selectedSupplier?.email?.toLowerCase() ?? null
  const sessionEmail = sessionData?.user.email?.toLowerCase() ?? null
  const isInstantClaimAvailable =
    !!selectedSupplierEmail &&
    !!sessionEmail &&
    selectedSupplierEmail === sessionEmail

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: claimSupplierSchema,
    },
    onSubmit: async ({ value }) => {
      await claimMutation.mutateAsync(value.supplierId)
    },
  })

  React.useEffect(() => {
    if (!initialSupplier) return
    form.setFieldValue('supplierId', initialSupplier.id)
    setSelectedSupplier(initialSupplier)
  }, [form, initialSupplier])

  return (
    <form
      id="claim-supplier-form"
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      className="grid gap-6"
    >
      <FieldGroup className="grid gap-6">
        <form.Field
          name="supplierId"
          children={(field) => (
            <FormField field={field} label="Your business" isRequired>
              <ClaimSupplierCombobox
                initialSupplier={initialSupplier}
                onSelect={(supplier) => {
                  field.handleChange(supplier?.id ?? '')
                  setSelectedSupplier(supplier)
                }}
              />
            </FormField>
          )}
        />
      </FieldGroup>

      <div className="grid gap-2">
        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            form="claim-supplier-form"
            disabled={
              claimMutation.isPending ||
              form.state.isSubmitting ||
              !selectedSupplier ||
              ('claimStatus' in selectedSupplier &&
                selectedSupplier.claimStatus !== 'available')
            }
          >
            {claimMutation.isPending
              ? 'Saving…'
              : !selectedSupplier
                ? 'Send email'
                : isInstantClaimAvailable
                  ? 'Claim supplier'
                  : 'Send email'}
          </Button>
        </div>
        <p className="text-right text-xs text-muted-foreground/60">
          {selectedSupplier
            ? isInstantClaimAvailable
              ? 'Account email match. Instant claim available.'
              : `A verification code will be sent to ${selectedSupplier.email}.`
            : ''}
        </p>
      </div>

      {claimMutation.isSuccess && (
        <p className="text-sm text-muted-foreground">
          {claimMutation.data.status === 'claimed'
            ? `${claimMutation.data.supplier.name} is now linked to your account.`
            : `We emailed a verification code to ${claimMutation.data.supplier.email}.`}
        </p>
      )}

      {claimMutation.error?.message && (
        <FormErrorMessage message={claimMutation.error.message} />
      )}
    </form>
  )
}

function ClaimSupplierCombobox({
  initialSupplier,
  onSelect,
}: {
  initialSupplier: Supplier | null
  onSelect: (supplier: SupplierClaimSearchResult | null) => void
}) {
  const [userInput, setUserInput] = React.useState(initialSupplier?.name ?? '')
  const [selectedSupplier, setSelectedSupplier] =
    React.useState<SupplierClaimSearchResult | null>(null)
  const { searchQuery, setSearchTerm, isPending } = useSupplierClaimSearch()

  React.useEffect(() => {
    if (!initialSupplier) return
    setUserInput(initialSupplier.name)
  }, [initialSupplier])

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
    if (userInput === '') return 'Start typing to find your supplier profile.'
    if (!searchQuery.isFetching && searchResults.length === 0)
      return 'No suppliers found yet.'
  }, [
    isPending,
    searchQuery.isError,
    searchQuery.isFetching,
    searchResults.length,
    userInput,
  ])

  return (
    <Combobox
      items={searchResults}
      itemToStringLabel={(supplier: SupplierClaimSearchResult) => supplier.name}
      filter={null}
      onValueChange={(nextValue) => {
        setUserInput(nextValue?.name ?? '')
        setSelectedSupplier(nextValue)
        onSelect(nextValue)
      }}
      onInputValueChange={(nextValue, { reason }) => {
        if (reason === 'item-press') return
        setUserInput(nextValue)
        setSearchTerm(nextValue)

        const selectedSupplierName =
          selectedSupplier?.name ?? initialSupplier?.name ?? ''
        if (nextValue !== selectedSupplierName) {
          setSelectedSupplier(null)
          onSelect(null)
        }
      }}
    >
      <ComboboxInput
        placeholder="Search by business name..."
        showClear={!!userInput}
        value={userInput}
      />
      <ComboboxContent className="grid gap-2 p-2">
        <ComboboxList>
          {(supplier: SupplierClaimSearchResult) => (
            <ComboboxItem
              key={supplier.id}
              value={supplier}
              disabled={supplier.claimStatus !== 'available'}
            >
              <p className="flex gap-2">
                <span>{supplier.name}</span>
                {supplier.region && (
                  <span className="text-muted-foreground">
                    {supplier.region}
                  </span>
                )}
                {supplier.claimStatus !== 'available' && (
                  <span className="text-muted-foreground">
                    {toClaimStatusLabel(supplier.claimStatus)}
                  </span>
                )}
              </p>
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxStatus className="text-sm text-pretty text-muted-foreground">
          {statusMessage}
        </ComboboxStatus>
      </ComboboxContent>
    </Combobox>
  )
}

function toClaimStatusLabel(status: SupplierClaimSearchResult['claimStatus']) {
  if (status === 'pending') return 'Claim pending'
  if (status === 'claimed') return 'Already claimed'
  if (status === 'claimedByYou') return 'Already linked to you'
  return ''
}
