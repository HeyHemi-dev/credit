'use client'

import { Loader2 } from 'lucide-react'
import React from 'react'
import {
  AuthUIContext,
  SettingsCard,
  socialProviders,
} from '@daveyplate/better-auth-ui'
import type { Account } from 'better-auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { tryCatch } from '@/lib/try-catch'
import { cn } from '@/lib/utils'

type SocialProvider = (typeof socialProviders)[number]

export function AccountProvidersCard() {
  const {
    authClient,
    basePath,
    baseURL,
    hooks: { useListAccounts },
    localization,
    mutators: { unlinkAccount },
    social,
    toast,
    viewPaths,
  } = React.useContext(AuthUIContext)

  const { data: accounts, isPending, refetch } = useListAccounts()

  const providers = React.useMemo(() => {
    return (social?.providers ?? []).flatMap((providerId) => {
      const provider = socialProviders.find((item) => item.provider === providerId)
      return provider ? [provider] : []
    })
  }, [social?.providers])

  return (
    <SettingsCard
      title={localization.PROVIDERS}
      description={localization.PROVIDERS_DESCRIPTION}
      isPending={isPending}
    >
      <div className="grid gap-4 px-6">
        {isPending
          ? providers.map((provider) => (
              <ProviderRowSkeleton key={provider.provider} provider={provider} />
            ))
          : providers.map((provider) => {
              const account =
                accounts?.find((item) => item.providerId === provider.provider) ?? null

              return (
                <ProviderRow
                  key={provider.provider}
                  account={account}
                  provider={provider}
                  onLink={async () => {
                    const callbackURL = `${baseURL}${basePath}/${viewPaths.CALLBACK}?redirectTo=${encodeURIComponent(window.location.pathname)}`
                    const { error } = await tryCatch(
                      authClient.linkSocial({
                        provider: provider.provider,
                        callbackURL,
                        fetchOptions: { throw: true },
                      }),
                    )

                    if (error) {
                      toast({
                        variant: 'error',
                        message: `Could not link ${provider.name} right now.`,
                      })
                      return
                    }

                    await refetch?.()
                  }}
                  onUnlink={async () => {
                    if (!account?.accountId) return

                    const { error } = await tryCatch(
                      unlinkAccount({
                        accountId: account.accountId,
                        providerId: provider.provider,
                      }),
                    )

                    if (error) {
                      toast({
                        variant: 'error',
                        message: `Could not unlink ${provider.name} right now.`,
                      })
                      return
                    }

                    await refetch?.()
                  }}
                />
              )
            })}
      </div>
    </SettingsCard>
  )
}

function ProviderRow({
  account,
  onLink,
  onUnlink,
  provider,
}: {
  account: Account | null
  onLink: () => Promise<void>
  onUnlink: () => Promise<void>
  provider: SocialProvider
}) {
  const { localization } = React.useContext(AuthUIContext)
  const [isLoading, setIsLoading] = React.useState(false)

  async function handleClick() {
    setIsLoading(true)

    if (account) await onUnlink()
    else await onLink()

    setIsLoading(false)
  }

  return (
    <Card className="min-w-0 flex-row items-center gap-3 px-4 py-3">
      {account ? (
        <LinkedProviderContent account={account} provider={provider} />
      ) : (
        <ProviderContent provider={provider} />
      )}

      <Button
        className="relative ms-auto shrink-0"
        disabled={isLoading}
        size="sm"
        type="button"
        variant={account ? 'outline' : 'default'}
        onClick={handleClick}
      >
        {isLoading ? <Loader2 className="animate-spin" /> : null}
        {account ? localization.UNLINK : localization.LINK}
      </Button>
    </Card>
  )
}

function LinkedProviderContent({
  account,
  provider,
}: {
  account: Account
  provider: SocialProvider
}) {
  const {
    hooks: { useAccountInfo },
  } = React.useContext(AuthUIContext)

  const { data: accountInfo, isPending } = useAccountInfo({
    query: { accountId: account.accountId },
  })

  return (
    <ProviderContent
      provider={provider}
      secondaryContent={
        isPending ? (
          <Skeleton className="my-0.5 h-3 w-28" />
        ) : accountInfo?.user.email ? (
          <span className="truncate text-muted-foreground text-xs">
            {accountInfo.user.email}
          </span>
        ) : null
      }
    />
  )
}

function ProviderContent({
  provider,
  secondaryContent,
}: {
  provider: SocialProvider
  secondaryContent?: React.ReactNode
}) {
  return (
    <>
      {provider.icon ? <provider.icon className="size-4 shrink-0" /> : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="text-sm">{provider.name}</div>
        {secondaryContent}
      </div>
    </>
  )
}

function ProviderRowSkeleton({ provider }: { provider: SocialProvider }) {
  return (
    <Card className="min-w-0 flex-row items-center gap-3 px-4 py-3">
      <ProviderContent
        provider={provider}
        secondaryContent={<Skeleton className={cn('h-3 w-28')} />}
      />
      <Skeleton className="ms-auto h-8 w-20 rounded-4xl" />
    </Card>
  )
}
