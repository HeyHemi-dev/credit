import { appendFileSync } from 'node:fs'
import { config } from 'dotenv'
import { z } from 'zod'
import { tryCatch, tryCatchSync } from '../src/lib/try-catch'
import { fail, requireEnv } from './helpers'

config({ path: '.env.local' })

const jsonValueSchema = z.union([
  z.record(z.string(), z.unknown()),
  z.array(z.unknown()),
])

type JsonValue = z.infer<typeof jsonValueSchema>

type RequestJsonOptions = {
  body?: JsonValue
  headers?: Record<string, string>
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST'
}

export function writeGithubOutput(key: string, value: string) {
  const outputPath = process.env.GITHUB_OUTPUT
  if (!outputPath) return

  appendFileSync(outputPath, `${key}=${value}\n`)
}

export function readDatabaseUrlParts(connectionString: string) {
  const databaseUrlResult = tryCatchSync(() => new URL(connectionString))
  if (databaseUrlResult.error) fail('Database connection string is not a valid URL.')

  const databaseUrl = databaseUrlResult.data
  const roleName = decodeURIComponent(databaseUrl.username)
  const databaseName = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ''))

  if (!roleName) fail('Database connection string does not include a role name.')
  if (!databaseName) fail('Database connection string does not include a database name.')

  return {
    databaseName,
    roleName,
  }
}

export function resolveVercelTeamId() {
  return process.env.VERCEL_TEAM_ID || process.env.VERCEL_ORG_ID || ''
}

export function requestHeaderToken(envKey: string) {
  return requireEnv(envKey)
}

export async function requestJson<T>(
  url: string,
  options: RequestJsonOptions = {},
  errorLabel = 'Request failed',
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  }

  if (options.body) headers['Content-Type'] = 'application/json'

  const fetchResult = await tryCatch(
    fetch(url, {
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers,
      method: options.method || 'GET',
    }),
  )
  if (fetchResult.error) fail(`${errorLabel}: network request failed.`)

  const response = fetchResult.data
  const textResult = await tryCatch(response.text())
  if (textResult.error) fail(`${errorLabel}: failed to read response body.`)

  const responseText = textResult.data
  const parsedResult = responseText
    ? tryCatchSync<JsonValue>(() => JSON.parse(responseText))
    : { data: {}, error: null }

  if (parsedResult.error) {
    fail(`${errorLabel}: response was not valid JSON.`)
  }

  if (!response.ok) {
    const messageResult = z
      .object({
        error: z
          .object({
            code: z.string().optional(),
            message: z.string().optional(),
          })
          .optional(),
      })
      .safeParse(parsedResult.data)

    const errorMessage = messageResult.success
      ? messageResult.data.error?.message
      : undefined

    fail(
      errorMessage
        ? `${errorLabel}: ${response.status} ${errorMessage}`
        : `${errorLabel}: ${response.status}`,
    )
  }

  return parsedResult.data as T
}

export async function sleep(milliseconds: number) {
  const sleepResult = await tryCatch(
    new Promise((resolve) => {
      setTimeout(resolve, milliseconds)
    }),
  )
  if (sleepResult.error) fail('Sleep was interrupted.')
}
