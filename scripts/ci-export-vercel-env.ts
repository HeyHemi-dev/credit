import { readFileSync } from 'node:fs'
import { parse } from 'dotenv'
import { z } from 'zod'
import { tryCatchSync } from '../src/lib/try-catch'
import { writeGithubEnv } from './ci-helpers'
import { fail } from './helpers'

const argsSchema = z.object({
  path: z.string().min(1),
})

function parseArgs() {
  const [path] = process.argv.slice(2)
  const argsResult = argsSchema.safeParse({ path })
  if (!argsResult.success) {
    console.log('Usage: tsx scripts/ci-export-vercel-env.ts <env-file-path>')
    process.exit(1)
  }

  return argsResult.data
}

function main() {
  const { path } = parseArgs()
  const envContentsResult = tryCatchSync(() => readFileSync(path, 'utf8'))
  if (envContentsResult.error) fail(`Failed to read env file: ${path}`)

  const parsedEnvResult = tryCatchSync(() => parse(envContentsResult.data))
  if (parsedEnvResult.error) fail(`Failed to parse env file: ${path}`)

  for (const [key, value] of Object.entries(parsedEnvResult.data)) {
    writeGithubEnv(key, value)
    console.log(`Exported ${key}`)
  }
}

main()
