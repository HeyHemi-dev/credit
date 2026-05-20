import { config } from 'dotenv'
import { z } from 'zod'
import { tryCatchSync } from '../src/lib/try-catch'
import { commandOutput, fail, requireEnv } from './helpers'

config({ path: '.env.local' })

const branchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  current_state: z.string().min(1),
})

const branchesSchema = z.array(branchSchema)

function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`Usage:
  pnpm neon:branches:list

Lists ready Neon branches for CR_NEON_PROJECT_ID.

Environment:
  CR_NEON_PROJECT_ID          Neon project id.`)
    process.exit(0)
  }

  const projectId = requireEnv('CR_NEON_PROJECT_ID')
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

  const activeBranches = branchesResult.data.filter(
    (branch) => branch.current_state === 'ready',
  )

  if (activeBranches.length === 0) {
    console.log('No active Neon branches found.')
    return
  }

  console.table(
    activeBranches.map((branch) => ({
      name: branch.name,
      id: branch.id,
    })),
  )
}

main()
