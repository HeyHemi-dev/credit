import { z } from 'zod'
import { tryCatch } from '../src/lib/try-catch'
import { requestHeaderToken, requestJson } from './ci-helpers'
import { fail, requireEnv } from './helpers'

const argsSchema = z.discriminatedUnion('mode', [
  z.object({
    databaseUrl: z.string().min(1),
    gitBranch: z.string().min(1),
    mode: z.literal('upsert'),
  }),
  z.object({
    gitBranch: z.string().min(1),
    mode: z.literal('remove'),
  }),
])

const envVarSchema = z.object({
  gitBranch: z.string().optional(),
  id: z.string().min(1),
  key: z.string().min(1),
  target: z.array(z.string()).catch([]),
})

const projectEnvSchema = z.union([
  z.array(envVarSchema),
  z.object({
    envs: z.array(envVarSchema),
  }),
])

function parseArgs() {
  const [mode, gitBranch, databaseUrl] = process.argv.slice(2)

  const argsResult = argsSchema.safeParse(
    mode === 'upsert'
      ? { databaseUrl, gitBranch, mode }
      : { gitBranch, mode },
  )

  if (!argsResult.success) {
    console.log(
      'Usage: tsx scripts/ci-vercel-preview-env.ts <upsert|remove> <git-branch> [database-url]',
    )
    process.exit(1)
  }

  return argsResult.data
}

function buildHeaders() {
  return {
    Authorization: `Bearer ${requestHeaderToken('VERCEL_TOKEN')}`,
  }
}

function buildProjectUrl(pathname: string) {
  const projectId = requireEnv('VERCEL_PROJECT_ID')
  const teamId = process.env.VERCEL_TEAM_ID || process.env.VERCEL_ORG_ID
  const url = new URL(
    `https://api.vercel.com${pathname.replace('{projectId}', projectId)}`,
  )
  if (teamId) url.searchParams.set('teamId', teamId)

  return url.toString()
}

function requireIsNotProductionBranch(gitBranch: string) {
  if (gitBranch === 'main') fail('Refusing to update preview env for production branch.')
}

async function listProjectEnvs(gitBranch: string) {
  const encodedBranch = encodeURIComponent(gitBranch)
  const url = buildProjectUrl(
    `/v10/projects/{projectId}/env?gitBranch=${encodedBranch}&decrypt=false`,
  )
  const response = await requestJson<unknown>(
    url,
    { headers: buildHeaders() },
    'Failed to list Vercel preview environment variables',
  )

  const parsedResponse = projectEnvSchema.safeParse(response)
  if (!parsedResponse.success) {
    fail('Vercel project env response was not the expected shape.')
  }

  const envVars = Array.isArray(parsedResponse.data)
    ? parsedResponse.data
    : parsedResponse.data.envs

  return envVars.filter(
    (envVar) =>
      envVar.key === 'CR_DATABASE_URL'
      && envVar.gitBranch === gitBranch
      && envVar.target.includes('preview'),
  )
}

async function upsertPreviewEnv(gitBranch: string, databaseUrl: string) {
  requireIsNotProductionBranch(gitBranch)

  await requestJson<unknown>(
    buildProjectUrl('/v10/projects/{projectId}/env?upsert=true'),
    {
      body: [
        {
          gitBranch,
          key: 'CR_DATABASE_URL',
          // Preview-only override for this git branch. Do not write to production.
          target: ['preview'],
          type: 'encrypted',
          value: databaseUrl,
        },
      ],
      headers: buildHeaders(),
      method: 'POST',
    },
    'Failed to upsert Vercel preview database env',
  )

  console.log(`Upserted Vercel preview CR_DATABASE_URL for branch ${gitBranch}.`)
}

async function removePreviewEnv(gitBranch: string) {
  requireIsNotProductionBranch(gitBranch)

  const envVars = await listProjectEnvs(gitBranch)
  if (envVars.length === 0) {
    console.log(`Vercel preview CR_DATABASE_URL already absent for branch ${gitBranch}.`)
    return
  }

  for (const envVar of envVars) {
    await requestJson<unknown>(
      buildProjectUrl(`/v10/projects/{projectId}/env/${envVar.id}`),
      {
        headers: buildHeaders(),
        method: 'DELETE',
      },
      'Failed to remove Vercel preview database env',
    )
  }

  console.log(`Removed Vercel preview CR_DATABASE_URL for branch ${gitBranch}.`)
}

async function main() {
  const args = parseArgs()

  if (args.mode === 'upsert') {
    await upsertPreviewEnv(args.gitBranch, args.databaseUrl)
    return
  }

  await removePreviewEnv(args.gitBranch)
}

const mainResult = await tryCatch(main())
if (mainResult.error) fail('Vercel preview env script failed.')
