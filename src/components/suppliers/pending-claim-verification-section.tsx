import { useForm } from '@tanstack/react-form'
import type { SupplierClaim } from '@/lib/types/front-end'
import { SUPPLIER_CLAIM_CODE_EXPIRY_MS } from '@/lib/constants'
import { formatDurationFromMs } from '@/lib/format-dates'
import { verifySupplierClaimCodeSchema } from '@/lib/types/validation-schema'
import {
  useSendSupplierClaimVerificationCode,
  useVerifySupplierClaimCode,
} from '@/hooks/use-supplier-claims'
import { FormErrorMessage } from '@/components/suppliers/supplier-claim-shared'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type VerifyClaimCodeFormValues = {
  code: string
}

const verifyCodeDefaultValues: VerifyClaimCodeFormValues = {
  code: '',
}

export function PendingClaimVerificationSection({
  claim,
}: {
  claim: SupplierClaim
}) {
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
        {/* TODO: make this a count down */}

        <p className="text-xs text-muted-foreground">
          Codes expire after {expiryDurationLabel}.
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
