import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import type { SupplierClaim } from '@/lib/types/front-end'
import { ClaimSupplierSummary } from '@/components/suppliers/claim-supplier-shared'
import { SUPPLIER_CLAIM_CODE_EXPIRY_MS } from '@/lib/constants'
import {
  formatDurationFromMs,
  formatRemainingMinutesFromMs,
} from '@/lib/format-dates'
import { verifySupplierClaimCodeSchema } from '@/lib/types/validation-schema'
import {
  useCancelPendingSupplierClaim,
  useSendSupplierClaimVerificationCode,
  useVerifySupplierClaimCode,
} from '@/hooks/use-supplier-claims'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { FieldGroup } from '@/components/ui/field'
import { FormErrorMessage } from '@/components/ui/form-error-message'
import { Input } from '@/components/ui/input'

type VerifyClaimCodeFormValues = {
  code: string
}

const verifyCodeDefaultValues: VerifyClaimCodeFormValues = {
  code: '',
}

export function ClaimSupplierVerificationPending({
  claim,
}: {
  claim: SupplierClaim
}) {
  const { cancelClaimMutation } = useCancelPendingSupplierClaim()
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
  const expiryDurationLabel = formatDurationFromMs(
    SUPPLIER_CLAIM_CODE_EXPIRY_MS,
  )

  return (
    <div className="grid gap-6">
      <ClaimSupplierSummary
        title="You are claiming this supplier profile."
        description={`We sent a verification code to ${claim.supplier.email}.`}
        supplier={claim.supplier}
      />

      <div className="grid gap-4 rounded-2xl border border-border/60 bg-background p-4">
        <div className="grid gap-1">
          <p className="text-sm text-muted-foreground">
            {claim.verification?.lastSentAt
              ? `We sent a verification code to ${claim.supplier.email}. Enter the 6-character code below to confirm that you own or manage this supplier profile.`
              : `We’ll send a 6-character verification code to ${claim.supplier.email}.`}
          </p>
        </div>

        {sendCodeMutation.isSuccess && (
          <p className="text-sm text-muted-foreground">
            We sent a new code to {claim.supplier.email}.
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

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <VerificationCodeExpiryMessage
            expiryDurationLabel={expiryDurationLabel}
            lastSentAt={claim.verification?.lastSentAt ?? null}
          />
          <Button
            type="button"
            variant="link"
            className="h-auto px-0 text-xs"
            onClick={() => sendCodeMutation.mutate()}
            disabled={sendCodeMutation.isPending}
          >
            {sendCodeMutation.isPending
              ? 'Sending…'
              : claim.verification?.lastSentAt
                ? 'Resend code'
                : 'Send code'}
          </Button>
        </div>

        {sendCodeMutation.error?.message && (
          <FormErrorMessage message={sendCodeMutation.error.message} />
        )}

        {verifyCodeMutation.error?.message && (
          <FormErrorMessage message={verifyCodeMutation.error.message} />
        )}
      </div>

      <div className="flex justify-start">
        <Button
          type="button"
          variant="link"
          className="h-auto px-0 text-sm"
          onClick={() => cancelClaimMutation.mutate()}
          disabled={cancelClaimMutation.isPending}
        >
          {cancelClaimMutation.isPending
            ? 'Changing supplier…'
            : 'Not the right supplier? Claim a different supplier.'}
        </Button>
      </div>

      {cancelClaimMutation.error?.message && (
        <FormErrorMessage message={cancelClaimMutation.error.message} />
      )}
    </div>
  )
}

function VerificationCodeExpiryMessage({
  expiryDurationLabel,
  lastSentAt,
}: {
  expiryDurationLabel: string
  lastSentAt: string | null
}) {
  const [currentTimeMs, setCurrentTimeMs] = React.useState(() => Date.now())

  const lastSentAtMs = lastSentAt ? new Date(lastSentAt).getTime() : null
  const remainingExpiryMs =
    lastSentAtMs === null
      ? null
      : lastSentAtMs + SUPPLIER_CLAIM_CODE_EXPIRY_MS - currentTimeMs

  React.useEffect(() => {
    if (lastSentAtMs === null) return

    setCurrentTimeMs(Date.now())

    const intervalId = window.setInterval(() => {
      setCurrentTimeMs(Date.now())
    }, 60_000)

    return () => window.clearInterval(intervalId)
  }, [lastSentAtMs])

  let message = `Codes expire after ${expiryDurationLabel}.`
  if (remainingExpiryMs !== null && remainingExpiryMs > 0) {
    message = `Code expires in ${formatRemainingMinutesFromMs(remainingExpiryMs)}.`
  }
  if (remainingExpiryMs !== null && remainingExpiryMs <= 0) {
    message = 'Code expired. Send code to get a new one.'
  }

  return <p className="text-xs text-muted-foreground">{message}</p>
}
