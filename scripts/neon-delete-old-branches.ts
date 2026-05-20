import { config } from 'dotenv'
import { z } from 'zod'
import { tryCatchSync } from '../src/lib/try-catch'
import {
  commandOutput,
  fail,
  isProtectedBranchId,
  requireEnv,
} from './helpers'

config({ path: '.env.local' })

const protectedBranchNames = new Set(['main', 'prod', 'production'])

const branchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  default: z.boolean().catch(false),
})

const branchesSchema = z.array(branchSchema)

function readBranches(projectId: string) {
  const output = commandOutput(
    'neon',
    [
      'branches',
      'list',
      '--project-id',
      projectId,
      '--output',
      'json',
      '--color=false',
      '--analytics=false',
    ],
    {},
  )

  const jsonResult = tryCatchSync(() => JSON.parse(output))
  if (jsonResult.error) {
    fail('Neon did not return valid JSON while listing branches.')
  }

  const branchesResult = branchesSchema.safeParse(jsonResult.data)
  if (!branchesResult.success) {
    fail('Neon branch list output was not the expected shape.')
  }

  return branchesResult.data
}

function main() {
  const branchIdsToDelete = process.argv.slice(2).filter((arg) => arg !== '--')

  if (branchIdsToDelete.length === 0) {
    console.log('Usage: pnpm db:delete-branches <branch-id> [branch-id...]')
    process.exit(1)
  }

  const projectId = requireEnv('CR_NEON_PROJECT_ID')

  for (const branchId of branchIdsToDelete) {
    if (isProtectedBranchId(branchId)) {
      fail(`Refusing to delete protected branch id: ${branchId}`)
    }
  }

  const branches = readBranches(projectId)

  for (const branchId of branchIdsToDelete) {
    const branch = branches.find((item) => item.id === branchId)
    if (!branch) fail(`Branch not found: ${branchId}`)
    if (branch.default) {
      fail(`Refusing to delete default branch: ${branch.name} (${branch.id})`)
    }
    if (protectedBranchNames.has(branch.name.toLowerCase())) {
      fail(`Refusing to delete protected branch: ${branch.name} (${branch.id})`)
    }
    if (isProtectedBranchId(branch.id)) {
      fail(`Refusing to delete protected branch: ${branch.name} (${branch.id})`)
    }

    commandOutput(
      'neon',
      [
        'branches',
        'delete',
        branch.id,
        '--project-id',
        projectId,
        '--color=false',
        '--analytics=false',
      ],
      {},
    )
    console.log(`Deleted Neon branch ${branch.name} (${branch.id}).`)
  }
}

main()
