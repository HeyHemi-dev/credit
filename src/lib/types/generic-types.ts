import type { HugeiconsIcon } from '@hugeicons/react'
import type { ComponentProps } from 'react'

export type ConstEnum = Record<string, string>

export type Href = {
  href: string
  label: string
}

export type IconSVGObject = ComponentProps<typeof HugeiconsIcon>['icon']
