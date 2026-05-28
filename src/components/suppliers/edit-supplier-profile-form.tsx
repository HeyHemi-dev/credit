import { useForm } from '@tanstack/react-form'
import { RadioGroup } from '@base-ui/react'
import { PillPickerItem, PillRadioItem } from '../ui/pill-radio-item'
import type { Supplier } from '@/lib/types/front-end'
import type { UpdateSupplierProfileForm } from '@/lib/types/validation-schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { FormErrorMessage } from '@/components/ui/form-error-message'
import { FieldGroup } from '@/components/ui/field'
import {
  REGION,
  REGION_KEYS,
  SERVICE,
  SERVICE_KEYS,
} from '@/lib/constants'
import { useSupplierProfile } from '@/hooks/use-suppliers'
import {
  regionSchema,
  updateSupplierProfileFormSchema,
} from '@/lib/types/validation-schema'
import {
  emptyStringToNull,
  nullToEmptyString,
} from '@/lib/empty-strings'

export function EditSupplierProfileForm({
  supplier,
  onSaved,
}: {
  supplier: Supplier
  onSaved?: (supplier: Supplier) => void
}) {
  const { updateProfileMutation } = useSupplierProfile()
  const defaultValues: UpdateSupplierProfileForm = {
    name: supplier.name,
    email: supplier.email,
    region: nullToEmptyString(supplier.region),
    regionsServed: supplier.regionsServed,
    services: supplier.services,
    website: nullToEmptyString(supplier.website),
    instagramHandle: nullToEmptyString(
      supplier.instagramHandle ? `@${supplier.instagramHandle}` : null,
    ),
    tiktokHandle: nullToEmptyString(
      supplier.tiktokHandle ? `@${supplier.tiktokHandle}` : null,
    ),
  }

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: updateSupplierProfileFormSchema,
    },
    onSubmit: async ({ value }) => {
      const nextSupplier = await updateProfileMutation.mutateAsync({
        ...value,
        region: emptyStringToNull(value.region),
        website: emptyStringToNull(value.website),
        instagramHandle: emptyStringToNull(value.instagramHandle),
        tiktokHandle: emptyStringToNull(value.tiktokHandle),
      })
      onSaved?.(nextSupplier)
    },
  })

  return (
    <form
      id="edit-supplier-profile-form"
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      className="grid gap-9"
    >
      <FieldGroup className="grid gap-6">
        <form.Field
          name="name"
          children={(field) => (
            <FormField field={field} label="Name" isRequired>
              <Input
                id={field.name}
                placeholder="Business name"
                autoComplete="off"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </FormField>
          )}
        />

        <form.Field
          name="email"
          children={(field) => (
            <FormField
              field={field}
              label="Contact email"
              description="Used for sharing and claim verification. Not shown publicly."
              isRequired
            >
              <Input
                id={field.name}
                placeholder="Email address"
                autoComplete="off"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </FormField>
          )}
        />

        <form.Field
          name="region"
          children={(field) => (
            <FormField
              field={field}
              label="Based in"
              description="Primary home region for this supplier."
            >
              <RadioGroup
                value={field.state.value}
                onValueChange={(value) => {
                  const { data: region } = regionSchema.safeParse(value)
                  field.handleChange(region ?? '')
                }}
                className="flex flex-wrap gap-2"
              >
                {REGION_KEYS.map((key) => {
                  const region = REGION[key]
                  const isSelected = field.state.value === region

                  return (
                    <PillRadioItem
                      key={key}
                      id={key}
                      value={region}
                      label={region}
                      isSelected={isSelected}
                      onClick={() => field.handleChange('')}
                    />
                  )
                })}
              </RadioGroup>
            </FormField>
          )}
        />

        <form.Field
          name="regionsServed"
          children={(field) => (
            <FormField
              field={field}
              label="Regions served"
              description="Where this supplier can work or travel."
            >
              <div className="flex flex-wrap gap-2">
                {REGION_KEYS.map((key) => {
                  const region = REGION[key]
                  const isSelected = field.state.value.includes(region)

                  return (
                    <PillPickerItem
                      key={key}
                      isSelected={isSelected}
                      onClick={() =>
                        field.handleChange(
                          toggleSelection(field.state.value, region),
                        )
                      }
                    >
                      {region}
                    </PillPickerItem>
                  )
                })}
              </div>
            </FormField>
          )}
        />

        <form.Field
          name="services"
          children={(field) => (
            <FormField
              field={field}
              label="Services"
              description="What this supplier offers."
            >
              <div className="flex flex-wrap gap-2">
                {SERVICE_KEYS.map((key) => {
                  const service = SERVICE[key]
                  const isSelected = field.state.value.includes(service)

                  return (
                    <PillPickerItem
                      key={key}
                      isSelected={isSelected}
                      onClick={() =>
                        field.handleChange(
                          toggleSelection(field.state.value, service),
                        )
                      }
                    >
                      {service}
                    </PillPickerItem>
                  )
                })}
              </div>
            </FormField>
          )}
        />

        <form.Field
          name="instagramHandle"
          children={(field) => (
            <FormField
              field={field}
              label="Instagram handle"
              description="If you use Instagram for this business."
            >
              <Input
                id={field.name}
                value={field.state.value}
                placeholder="@supplier"
                onChange={(event) => {
                  field.handleChange(
                    normalizeInstagramInput(event.target.value),
                  )
                }}
              />
            </FormField>
          )}
        />

        <form.Field
          name="tiktokHandle"
          children={(field) => (
            <FormField
              field={field}
              label="TikTok handle"
              description="If you use TikTok for this business."
            >
              <Input
                id={field.name}
                value={field.state.value}
                placeholder="@supplier"
                onChange={(event) =>
                  field.handleChange(normalizeTiktokInput(event.target.value))
                }
              />
            </FormField>
          )}
        />

        <form.Field
          name="website"
          children={(field) => (
            <FormField
              field={field}
              label="Website"
              description="Full website URL."
            >
              <Input
                id={field.name}
                value={field.state.value}
                placeholder="https://example.com"
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </FormField>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end">
        <Button
          type="submit"
          form="edit-supplier-profile-form"
          disabled={form.state.isSubmitting || updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      {updateProfileMutation.error?.message && (
        <FormErrorMessage message={updateProfileMutation.error.message} />
      )}
      {updateProfileMutation.isSuccess && (
        <p className="text-sm text-muted-foreground">
          Supplier profile updated.
        </p>
      )}
    </form>
  )
}

function normalizeInstagramInput(input: string) {
  if (input.startsWith('https://www.instagram.com/')) {
    input = input.replace('https://www.instagram.com/', '@')
  }
  if (input.endsWith('/')) {
    input = input.slice(0, -1)
  }
  return input
}

function normalizeTiktokInput(input: string) {
  if (input.startsWith('https://www.tiktok.com/')) {
    input = input.replace('https://www.tiktok.com/', '@')
  }
  if (input.endsWith('/')) {
    input = input.slice(0, -1)
  }
  return input
}

function toggleSelection<T>(items: Array<T>, item: T) {
  if (items.includes(item)) return items.filter((value) => value !== item)
  return [...items, item]
}
