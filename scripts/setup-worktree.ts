import {
  copyFileSync,
  existsSync,
  readFileSync,
  realpathSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { join, resolve, sep } from 'node:path'
import { parse } from 'dotenv'
import { z } from 'zod'
import { tryCatchSync } from '../src/lib/try-catch'
import {
  commandOutput,
  fail,
  isProtectedBranchId,
} from './helpers'

const sourceRepoPath = '/Users/hemi/Dev/credit'
const envFileName = '.env.local'
const requiredEnvKeys = [
  'CR_DATABASE_URL',
  'CR_NEON_PROJECT_ID',
  'NEON_DEV_BRANCH_ID',
] as const
const dbBranchLimit = 10

const neonBranchesSchema = z.array(
  z.object({
    id: z.string(),
  }),
)

function getActiveDbBranchCount(projectId: string, cwd: string): number {
  const branchesOutput = commandOutput(
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
    { cwd },
  )

  const branchesJsonResult = tryCatchSync(() => JSON.parse(branchesOutput))
  if (branchesJsonResult.error) fail('Neon did not return valid JSON while listing branches.')

  const branchesResult = neonBranchesSchema.safeParse(branchesJsonResult.data)
  if (!branchesResult.success) fail('Neon branch list output was not a valid branch array.')

  return branchesResult.data.length
}

function printDbBranchUsage(projectId: string, cwd: string): void {
  const activeDbBranchCount = getActiveDbBranchCount(projectId, cwd)
  console.log(`${activeDbBranchCount}/${dbBranchLimit} DB branches used.`)
}
const args = process.argv.slice(2)
let mode: 'cleanup' | 'setup' = 'setup'
let targetPath: string | undefined

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index]
  if (!arg) continue

  if (index === 0 && arg === 'cleanup') {
    mode = 'cleanup'
    continue
  }

  if (arg === '--help' || arg === '-h') {
    console.log(`Usage:
  pnpm worktree:setup <worktree-path>
  pnpm worktree:setup cleanup <worktree-path>

Copies .env.local from ${sourceRepoPath},
creates a Neon branch from NEON_DEV_BRANCH_ID, and updates CR_DATABASE_URL.

Arguments:
  worktree-path              Target Codex worktree path.
  cleanup                    Delete the recorded Neon worktree branch.

Options:
  --help                     Show this help.

Examples:
  pnpm worktree:setup "$CODEX_WORKTREE_PATH"
  pnpm worktree:setup cleanup "$CODEX_WORKTREE_PATH"`)
    process.exit(0)
  }

  if (arg.startsWith('--')) fail(`Unknown option: ${arg}`)
  if (targetPath) fail(`Unexpected extra argument: ${arg}`)

  targetPath = arg
}

if (!targetPath) fail('worktree-path is required.')

const targetPathAbsolute = resolve(targetPath)
if (!existsSync(targetPathAbsolute)) fail(`Target worktree does not exist: ${targetPathAbsolute}`)
if (!statSync(targetPathAbsolute).isDirectory()) {
  fail(`Target worktree is not a directory: ${targetPathAbsolute}`)
}

const targetRoot = realpathSync(targetPathAbsolute)
const targetEnvPath = join(targetRoot, envFileName)

if (mode === 'cleanup') {
  if (!existsSync(targetEnvPath)) {
    console.log(`No ${envFileName} found at ${targetEnvPath}; nothing to clean up.`)
    process.exit(0)
  }

  const targetEnv = parse(readFileSync(targetEnvPath))
  const projectId = targetEnv.CR_NEON_PROJECT_ID
  const branchId = targetEnv.NEON_WORKTREE_BRANCH_ID

  if (!branchId) {
    console.log(`No NEON_WORKTREE_BRANCH_ID found in ${targetEnvPath}; nothing to clean up.`)
    process.exit(0)
  }

  if (!projectId) fail(`CR_NEON_PROJECT_ID is missing from ${targetEnvPath}.`)

  if (isProtectedBranchId(branchId, targetEnv)) {
    console.log(`Skipping protected Neon branch cleanup: ${branchId}`)
    process.exit(0)
  }

  console.log(`Target env: ${targetEnvPath}`)
  console.log(`Deleting Neon worktree branch: ${branchId}`)

  commandOutput(
    'neon',
    [
      'branches',
      'delete',
      branchId,
      '--project-id',
      projectId,
      '--color=false',
      '--analytics=false',
    ],
    { cwd: targetRoot },
  )

  const targetEnvContents = readFileSync(targetEnvPath, 'utf8')
  writeFileSync(
    targetEnvPath,
    targetEnvContents.replace(
      /^(?:export\s+)?NEON_WORKTREE_BRANCH_ID\s*=.*(?:\n|$)/m,
      '',
    ),
  )

  console.log(`Deleted Neon branch ${branchId}.`)
  printDbBranchUsage(projectId, targetRoot)
  console.log(`Removed Neon worktree metadata from ${targetEnvPath}.`)
  process.exit(0)
}

const sourceRoot = realpathSync(sourceRepoPath)
const sourceEnvPath = join(sourceRoot, envFileName)

if (sourceRoot === targetRoot) fail('source repo and target worktree are the same.')
if (!existsSync(sourceEnvPath)) fail(`source ${envFileName} does not exist: ${sourceEnvPath}`)

const targetGitTopLevel = realpathSync(
  commandOutput('git', ['rev-parse', '--show-toplevel'], {
    cwd: targetRoot,
  }),
)
if (targetGitTopLevel !== targetRoot) {
  fail(`target path is inside a git worktree, but not at its root: ${targetRoot}`)
}

const sourceEnv = parse(readFileSync(sourceEnvPath))
for (const key of requiredEnvKeys) {
  if (!sourceEnv[key]) fail(`${key} is missing from ${sourceEnvPath}.`)
}

const databaseUrlResult = tryCatchSync(() => new URL(sourceEnv.CR_DATABASE_URL))
if (databaseUrlResult.error) fail('CR_DATABASE_URL is not a valid URL.')

const databaseUrl = databaseUrlResult.data
const roleName = decodeURIComponent(databaseUrl.username)
const databaseName = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ''))
const isPooled = databaseUrl.hostname.includes('-pooler')
const sslMode = databaseUrl.searchParams.get('sslmode') || 'require'

if (!roleName) fail('CR_DATABASE_URL does not include a role/user name.')
if (!databaseName) fail('CR_DATABASE_URL does not include a database name.')

const targetPathParts = targetRoot.split(sep)
const worktreesSegmentIndex = targetPathParts.findIndex(
  (part, index) => part === 'worktrees' && targetPathParts[index - 1] === '.codex',
)
const worktreeName = targetPathParts[worktreesSegmentIndex + 1]
if (worktreesSegmentIndex === -1 || !worktreeName) {
  fail('target path must be inside .codex/worktrees/<name>.')
}

const neonBranchName =
  `worktree/${worktreeName}`
    .trim()
    .replace(/\\/g, '/')
    .replace(/[^A-Za-z0-9._/-]+/g, '-')
    .replace(/\/{2,}/g, '/')
    .replace(/-{2,}/g, '-')
    .replace(/^[/. -]+|[/. -]+$/g, '')
    .slice(0, 256) || `worktree/${Date.now()}`

console.log(`Source env: ${sourceEnvPath}`)
console.log(`Target env: ${targetEnvPath}`)
console.log(`Neon parent branch: ${sourceEnv.NEON_DEV_BRANCH_ID}`)
console.log(`New Neon branch: ${neonBranchName}`)
console.log(`Role/database: ${roleName}/${databaseName}`)

if (!existsSync(targetEnvPath)) {
  copyFileSync(sourceEnvPath, targetEnvPath)
  console.log(`Copied ${envFileName} to target worktree.`)
} else {
  console.log(`Target ${envFileName} already exists; keeping it.`)
}

const createOutput = commandOutput(
  'neon',
  [
    'branches',
    'create',
    '--project-id',
    sourceEnv.CR_NEON_PROJECT_ID,
    '--parent',
    sourceEnv.NEON_DEV_BRANCH_ID,
    '--name',
    neonBranchName,
    '--output',
    'json',
    '--color=false',
    '--analytics=false',
  ],
  { cwd: sourceRoot },
)

const neonCreateSchema = z.object({
  branch: z.object({
    id: z.string(),
  }),
})
const createJsonResult = tryCatchSync(() => JSON.parse(createOutput))
if (createJsonResult.error) fail('Neon did not return valid JSON while creating the branch.')

const createResult = neonCreateSchema.safeParse(createJsonResult.data)
if (!createResult.success) fail('Neon branch create output did not include branch.id.')

const createdBranch = createResult.data.branch
const connectionStringOutput = commandOutput(
  'neon',
  [
    'connection-string',
    createdBranch.id,
    '--project-id',
    sourceEnv.CR_NEON_PROJECT_ID,
    '--role-name',
    roleName,
    '--database-name',
    databaseName,
    '--endpoint-type',
    'read_write',
    '--ssl',
    sslMode,
    ...(isPooled ? ['--pooled'] : []),
    '--color=false',
    '--analytics=false',
  ],
  { cwd: sourceRoot },
)
const connectionString = connectionStringOutput
  .split(/\s+/)
  .find((part) => /^postgres(?:ql)?:\/\//.test(part))

if (!connectionString) {
  fail('Neon connection-string output did not include a Postgres URL.')
}

let targetEnvContents = readFileSync(targetEnvPath, 'utf8')
for (const [key, value] of [
  ['CR_DATABASE_URL', connectionString],
  ['NEON_WORKTREE_BRANCH_ID', createdBranch.id],
]) {
  const assignment = `${key}=${JSON.stringify(value)}`
  const pattern = new RegExp(`^(?:export\\s+)?${key}\\s*=.*$`, 'm')

  targetEnvContents = pattern.test(targetEnvContents)
    ? targetEnvContents.replace(pattern, assignment)
    : `${targetEnvContents}${targetEnvContents.endsWith('\n') ? '' : '\n'}${assignment}\n`
}

writeFileSync(targetEnvPath, targetEnvContents)

console.log(`Created Neon branch ${createdBranch.id}.`)
printDbBranchUsage(sourceEnv.CR_NEON_PROJECT_ID, sourceRoot)
console.log(`Updated CR_DATABASE_URL in ${targetEnvPath}.`)
