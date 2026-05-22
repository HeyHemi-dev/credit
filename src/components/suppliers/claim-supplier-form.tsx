import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import { Alert02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type {
  Supplier,
  SupplierClaim,
  SupplierClaimSearchResult,
} from '@/lib/types/front-end'
import { authClient } from '@/auth'
import {
  claimSupplierSchema,
  verifySupplierClaimCodeSchema,
} from '@/lib/types/validation-schema'
import {
  useClaimSupplier,
  useMySupplierClaim,
  useSendSupplierClaimVerificationCode,
  useSupplierClaimSearch,
  useVerifySupplierClaimCode,
} from '@/hooks/use-supplier-claims'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
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

type VerifyClaimCodeFormValues = {
  code: string
}

const defaultValues: ClaimSupplierFormValues = {
  supplierId: '',
}

const verifyCodeDefaultValues: VerifyClaimCodeFormValues = {
  code: '',
}

// TODO: move card to separate file
// TODO: make a settings card component for consistent styling of cards. props: title, description, children
export function ClaimSupplierSettingsCard() {
  const { claimQuery } = useMySupplierClaim()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg leading-none font-semibold md:text-xl">
          Claim Your Business
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Search for your business to start a claim. We will email you a
          one-time code to verify your ownership.
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
          <>
            <ClaimStateMessage
              title="Your supplier claim is pending."
              description="Finish verification with the 6-character code sent to this supplier email."
              supplier={claimQuery.data.supplier}
            />
            <PendingClaimVerificationSection claim={claimQuery.data} />
          </>
        )}

        {claimQuery.data?.status !== 'claimed' && (
          <ClaimSupplierForm
            initialSupplier={claimQuery.data?.supplier ?? null}
          />
        )}
      </CardContent>
    </Card>
  )
}

function ClaimSupplierForm({
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

// TODO: Move to separate file
function PendingClaimVerificationSection({ claim }: { claim: SupplierClaim }) {
  const { sendCodeMutation } = useSendSupplierClaimVerificationCode()
  const { verifyCodeMutation } = useVerifySupplierClaimCode()

  const form = useForm({
    defaultValues: verifyCodeDefaultValues,
    validators: {
      onSubmit: verifySupplierClaimCodeSchema,
    },
    onSubmit: async ({ value }) => {
      await verifyCodeMutation.mutateAsync(value.code)
    },
  })

  return (
    <div className="grid gap-4 rounded-2xl border border-border/60 bg-background p-4">
      <div className="grid gap-1">
        <p className="font-medium">Verify by email</p>
        <p className="text-sm text-muted-foreground">
          {claim.verification?.lastSentAt
            ? `We sent a code to ${claim.supplier.email}. Enter it below to finish your claim.`
            : `We’ll send a 6-character code to ${claim.supplier.email}.`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => sendCodeMutation.mutate()}
          disabled={sendCodeMutation.isPending}
        >
          {sendCodeMutation.isPending
            ? 'Sending…'
            : claim.verification?.lastSentAt
              ? 'Resend code'
              : 'Send code'}
        </Button>
        {/* TODO: derive X mins from SUPPLIER_CLAIM_CODE_EXPIRY_MS, so server and UI stay in sync */}
        {/* TODO: make this a count down */}
        {/* Create a relative time formatting fn (if it doesn't exist) for formating MS in s, m, h, d, months */}
        <p className="text-xs text-muted-foreground">
          Codes expire after 10 minutes.
        </p>
      </div>

      {sendCodeMutation.isSuccess && (
        <p className="text-sm text-muted-foreground">
          We sent a fresh code to {claim.supplier.email}.
        </p>
      )}

      <form
        id="verify-supplier-claim-form"
        onSubmit={(event) => {
          event.preventDefault()
          form.handleSubmit()
        }}
        className="grid gap-4"
      >
        <FieldGroup className="grid gap-4">
          <form.Field
            name="code"
            children={(field) => (
              <FormField
                field={field}
                label="Verification code"
                description="Enter the 6-character code from your email."
                isRequired
              >
                <Input
                  id={field.name}
                  inputMode="text"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="a1b2c3"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(
                      event.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '')
                        .slice(0, 6),
                    )
                  }
                />
              </FormField>
            )}
          />
        </FieldGroup>

        <div className="flex justify-end">
          <Button
            type="submit"
            form="verify-supplier-claim-form"
            disabled={verifyCodeMutation.isPending || form.state.isSubmitting}
          >
            {verifyCodeMutation.isPending ? 'Verifying…' : 'Verify claim'}
          </Button>
        </div>
      </form>

      {sendCodeMutation.error?.message && (
        <FormErrorMessage message={sendCodeMutation.error.message} />
      )}

      {verifyCodeMutation.error?.message && (
        <FormErrorMessage message={verifyCodeMutation.error.message} />
      )}
    </div>
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

// TODO: inline function
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

// TODO: consider if this should be generic and used in other forms (if so, move to generic place)
function FormErrorMessage({ message }: { message: string }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-2 rounded-2xl bg-destructive/5 p-4 text-destructive ring-1 ring-destructive/10">
      <HugeiconsIcon icon={Alert02Icon} className="size-4" />
      <span>{message}</span>
    </div>
  )
}

// TODO: make this inline
function getClaimStatusLabel(status: SupplierClaimSearchResult['claimStatus']) {
  if (status === 'pending') return 'Claim pending'
  if (status === 'claimed') return 'Already claimed'
  if (status === 'claimedByYou') return 'Already linked to you'
  return ''
}
