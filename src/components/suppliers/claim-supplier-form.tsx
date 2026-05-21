import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import { Alert02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type {
  Supplier,
  SupplierClaimSearchResult,
} from '@/lib/types/front-end'
import { claimSupplierSchema } from '@/lib/types/validation-schema'
import { useClaimSupplier, useMySupplierClaim, useSupplierClaimSearch } from '@/hooks/use-supplier-claims'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

export function ClaimSupplierSettingsCard() {
  const { claimQuery } = useMySupplierClaim()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Claim supplier profile</CardTitle>
        <CardDescription>
          Search for your business and submit a claim request from settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {claimQuery.data?.status === 'claimed' && (
          <ClaimStateMessage
            title="This supplier profile is already yours."
            description="You’re connected to the supplier profile below."
            supplier={claimQuery.data.supplier}
          />
        )}

        {claimQuery.data?.status === 'pending' && (
          <ClaimStateMessage
            title="Your supplier claim is pending."
            description="You can update the selected supplier below before verification is added."
            supplier={claimQuery.data.supplier}
          />
        )}

        {claimQuery.data?.status !== 'claimed' && (
          <ClaimSupplierForm
            initialSupplier={claimQuery.data?.supplier ?? null}
            isPendingClaim={claimQuery.data?.status === 'pending'}
          />
        )}
      </CardContent>
    </Card>
  )
}

function ClaimSupplierForm({
  initialSupplier,
  isPendingClaim,
}: {
  initialSupplier: Supplier | null
  isPendingClaim: boolean
}) {
  const { claimMutation } = useClaimSupplier()
  const [selectedSupplier, setSelectedSupplier] =
    React.useState<SupplierClaimSearchResult | Supplier | null>(initialSupplier)

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
            <FormField
              field={field}
              label="Supplier"
              description="Search for the supplier record that matches your business."
              isRequired
            >
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

      <div className="flex justify-end">
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
            : isPendingClaim
              ? 'Update claim request'
              : 'Claim supplier'}
        </Button>
      </div>

      {claimMutation.isSuccess && (
        <p className="text-sm text-muted-foreground">
          Claim request saved for {claimMutation.data.supplier.name}.
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
    if (userInput === '') return 'Start typing to search for your supplier profile.'
    if (!searchQuery.isFetching && searchResults.length === 0) return 'No suppliers found yet.'
  }, [isPending, searchQuery.isError, searchQuery.isFetching, searchResults.length, userInput])

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
        placeholder="Search suppliers..."
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
                    {getClaimStatusLabel(supplier.claimStatus)}
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

function ClaimStateMessage({
  title,
  description,
  supplier,
}: {
  title: string
  description: string
  supplier: Supplier
}) {
  return (
    <div className="grid gap-2 rounded-2xl border border-border/60 bg-muted/30 p-4">
      <div className="grid gap-0.5">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <SupplierSummary supplier={supplier} />
    </div>
  )
}

function SupplierSummary({ supplier }: { supplier: Supplier }) {
  return (
    <div className="grid gap-0.5 text-sm">
      <p className="font-medium">{supplier.name}</p>
      <p className="text-muted-foreground">{supplier.email}</p>
      {supplier.region && (
        <p className="text-muted-foreground">Based in {supplier.region}</p>
      )}
    </div>
  )
}

function FormErrorMessage({ message }: { message: string }) {
  return (
    <div className="text-destructive bg-destructive/5 ring-destructive/10 grid grid-cols-[auto_1fr] gap-2 rounded-2xl p-4 ring-1">
      <HugeiconsIcon icon={Alert02Icon} className="size-4" />
      <span>{message}</span>
    </div>
  )
}

function getClaimStatusLabel(status: SupplierClaimSearchResult['claimStatus']) {
  if (status === 'pending') return 'Claim pending'
  if (status === 'claimed') return 'Already claimed'
  if (status === 'claimedByYou') return 'Already yours'
  return ''
}
