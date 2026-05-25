import { z } from 'zod'
import { tryCatch } from '../src/lib/try-catch'
import {
  readDatabaseUrlParts,
  requestHeaderToken,
  requestJson,
  sleep,
  writeGithubOutput,
} from './ci-helpers'
import { fail, requireEnv } from './helpers'

const argsSchema = z.object({
  mode: z.enum(['cleanup', 'ensure']),
  prNumber: z.number().int().positive(),
})

const branchListSchema = z.object({
  branches: z.array(
    z.object({
      current_state: z.string().catch(''),
      id: z.string().min(1),
      name: z.string().min(1),
    }),
  ),
})

const createBranchSchema = z.object({
  branch: z.object({
    current_state: z.string().catch(''),
    id: z.string().min(1),
    name: z.string().min(1),
  }),
})

const branchDetailsSchema = z.object({
  branch: z.object({
    current_state: z.string().catch(''),
    id: z.string().min(1),
    name: z.string().min(1),
  }),
})

const connectionUriSchema = z.object({
  uri: z.string().min(1),
})

function parseArgs() {
  const [mode, prNumberArg] = process.argv.slice(2)
  const prNumberResult = z.coerce.number().int().positive().safeParse(prNumberArg)
  const argsResult = argsSchema.safeParse({
    mode,
    prNumber: prNumberResult.success ? prNumberResult.data : Number.NaN,
  })

  if (!argsResult.success) {
    console.log('Usage: tsx scripts/ci-neon-pr-branch.ts <ensure|cleanup> <pr-number>')
    process.exit(1)
  }

  return argsResult.data
}

function buildHeaders() {
  return {
    Authorization: `Bearer ${requestHeaderToken('NEON_API_KEY')}`,
  }
}

function buildBranchName(prNumber: number) {
  return `pr-${prNumber}`
}

function buildProjectUrl(pathname: string) {
  const projectId = requireEnv('CR_NEON_PROJECT_ID')
  return `https://console.neon.tech/api/v2/projects/${projectId}${pathname}`
}

async function findBranchByName(branchName: string) {
  const response = await requestJson<unknown>(
    buildProjectUrl(`/branches?search=${encodeURIComponent(branchName)}`),
    { headers: buildHeaders() },
    'Failed to list Neon branches',
  )

  const parsedResponse = branchListSchema.safeParse(response)
  if (!parsedResponse.success) fail('Neon branches response was not the expected shape.')

  return parsedResponse.data.branches.find((branch) => branch.name === branchName) || null
}

async function waitForBranchReady(branchId: string) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const response = await requestJson<unknown>(
      buildProjectUrl(`/branches/${branchId}`),
      { headers: buildHeaders() },
      'Failed to read Neon branch details',
    )

    const parsedResponse = branchDetailsSchema.safeParse(response)
    if (!parsedResponse.success) fail('Neon branch details response was not the expected shape.')

    const branch = parsedResponse.data.branch
    if (branch.current_state === 'ready') return branch

    await sleep(2_000)
  }

  fail(`Neon branch did not become ready in time: ${branchId}`)
}

async function createBranch(branchName: string) {
  const parentBranchId = requireEnv('NEON_PROD_BRANCH_ID')
  const response = await requestJson<unknown>(
    buildProjectUrl('/branches'),
    {
      body: {
        branch: {
          name: branchName,
          parent_id: parentBranchId,
        },
        endpoints: [
          {
            type: 'read_write',
          },
        ],
      },
      headers: buildHeaders(),
      method: 'POST',
    },
    'Failed to create Neon branch',
  )

  const parsedResponse = createBranchSchema.safeParse(response)
  if (!parsedResponse.success) fail('Neon create branch response was not the expected shape.')

  return waitForBranchReady(parsedResponse.data.branch.id)
}

async function restoreBranch(branchId: string) {
  const sourceBranchId = requireEnv('NEON_PROD_BRANCH_ID')

  await requestJson<unknown>(
    buildProjectUrl(`/branches/${branchId}/restore`),
    {
      body: {
        source_branch_id: sourceBranchId,
      },
      headers: buildHeaders(),
      method: 'POST',
    },
    'Failed to restore Neon branch from production',
  )

  return waitForBranchReady(branchId)
}

async function deleteBranch(branchId: string) {
  await requestJson<unknown>(
    buildProjectUrl(`/branches/${branchId}`),
    {
      headers: buildHeaders(),
      method: 'DELETE',
    },
    'Failed to delete Neon branch',
  )
}

async function readConnectionUri(branchId: string) {
  const { databaseName, roleName } = readDatabaseUrlParts(
    requireEnv('PROD_CR_DATABASE_URL'),
  )

  const searchParams = new URLSearchParams({
    branch_id: branchId,
    database_name: databaseName,
    role_name: roleName,
  })

  const response = await requestJson<unknown>(
    buildProjectUrl(`/connection_uri?${searchParams.toString()}`),
    { headers: buildHeaders() },
    'Failed to read Neon connection URI',
  )

  const parsedResponse = connectionUriSchema.safeParse(response)
  if (!parsedResponse.success) fail('Neon connection URI response was not the expected shape.')

  return parsedResponse.data.uri
}

async function ensureBranch(prNumber: number) {
  const branchName = buildBranchName(prNumber)
  const existingBranch = await findBranchByName(branchName)
  const branch = existingBranch
    ? await restoreBranch(existingBranch.id)
    : await createBranch(branchName)
  const databaseUrl = await readConnectionUri(branch.id)

  writeGithubOutput('branch_id', branch.id)
  writeGithubOutput('branch_name', branch.name)
  writeGithubOutput('database_url', databaseUrl)

  console.log(
    JSON.stringify(
      {
        branchId: branch.id,
        branchName: branch.name,
        databaseUrl,
      },
      null,
      2,
    ),
  )
}

async function cleanupBranch(prNumber: number) {
  const branchName = buildBranchName(prNumber)
  const existingBranch = await findBranchByName(branchName)
  if (!existingBranch) {
    console.log(`Neon branch already absent: ${branchName}`)
    return
  }

  const isProtectedBranch = existingBranch.id === requireEnv('NEON_PROD_BRANCH_ID')
  if (isProtectedBranch) fail(`Refusing to delete protected Neon branch: ${existingBranch.id}`)

  await deleteBranch(existingBranch.id)
  console.log(`Deleted Neon branch ${existingBranch.name} (${existingBranch.id}).`)
}

async function main() {
  const { mode, prNumber } = parseArgs()

  if (mode === 'ensure') {
    await ensureBranch(prNumber)
    return
  }

  await cleanupBranch(prNumber)
}

const mainResult = await tryCatch(main())
if (mainResult.error) fail('Neon PR branch script failed.')
