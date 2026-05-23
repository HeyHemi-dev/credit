import { createServerOnlyFn } from '@tanstack/react-start'
import { z } from 'zod'
import { ERROR } from '@/lib/errors'

const envValueSchema = z.string().min(1)

export const requireEnv = createServerOnlyFn((key: string) => {
  const { data, error } = envValueSchema.safeParse(process.env[key])
  if (error) throw ERROR.INVALID_STATE(`${key} is not set`)
  return data
})
