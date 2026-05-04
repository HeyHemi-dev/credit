import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  readFileSync,
  realpathSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { parse } from 'dotenv'

type Options = {
  mode: 'cleanup' | 'setup'
  targetPath?: string
}

const sourceRepoPath = '/Users/hemi/Dev/credit'
const envFileName = '.env.local'
const requiredEnvKeys = [
  'CR_DATABASE_URL',
  'CR_NEON_PROJECT_ID',
  'NEON_DEV_BRANCH_ID',
] as const

function usage() {
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
}

function parseArgs(argv: Array<string>): Options {
  const options: Options = {
    mode: 'setup',
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (!arg) continue

    if (index === 0 && arg === 'cleanup') {
      options.mode = 'cleanup'
      continue
    }

    if (arg === '--help' || arg === '-h') {
      usage()
      process.exit(0)
    }

    if (arg.startsWith('--')) {
      fail(`Unknown option: ${arg}`)
    }

    if (options.targetPath) fail(`Unexpected extra argument: ${arg}`)
    options.targetPath = arg
  }

  return options
}

function fail(message: string): never {
  console.error(`worktree setup failed: ${message}`)
  process.exit(1)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function commandOutput(command: string, args: Array<string>, cwd: string): string {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
  })

  if (result.error) {
    if ('code' in result.error && result.error.code === 'ENOENT') {
      fail(`${command} was not found on PATH.`)
    }

    fail(`${command} failed: ${result.error.message}`)
  }

  if (result.status !== 0) {
    const details = (result.stderr || result.stdout).trim()
    fail(
      details
        ? `${command} ${args.join(' ')} exited with ${result.status}:\n${details}`
        : `${command} ${args.join(' ')} exited with ${result.status}.`,
    )
  }

  return result.stdout.trim()
}

function gitOutput(args: Array<string>, cwd: string): string {
  return commandOutput('git', args, cwd)
}

function getGitTopLevel(cwd: string): string {
  return gitOutput(['rev-parse', '--show-toplevel'], cwd)
}

function readEnv(path: string): Record<string, string> {
  return parse(readFileSync(path))
}

function requireEnvValues(env: Record<string, string>, envPath: string) {
  for (const key of requiredEnvKeys) {
    if (!env[key]) {
      fail(`${key} is missing from ${envPath}.`)
    }
  }
}

function parseDatabaseUrl(databaseUrl: string) {
  try {
    const url = new URL(databaseUrl)
    const roleName = decodeURIComponent(url.username)
    const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ''))
    const pooled = url.hostname.includes('-pooler')

    if (!roleName) fail('CR_DATABASE_URL does not include a role/user name.')
    if (!databaseName) fail('CR_DATABASE_URL does not include a database name.')

    return {
      databaseName,
      pooled,
      roleName,
      sslMode: url.searchParams.get('sslmode') || 'require',
    }
  } catch (error) {
    fail(
      error instanceof Error
        ? `CR_DATABASE_URL is not a valid URL: ${error.message}`
        : 'CR_DATABASE_URL is not a valid URL.',
    )
  }
}

function sanitizeNeonBranchName(name: string): string {
  const sanitized = name
    .trim()
    .replace(/\\/g, '/')
    .replace(/[^A-Za-z0-9._/-]+/g, '-')
    .replace(/\/{2,}/g, '/')
    .replace(/-{2,}/g, '-')
    .replace(/^[/. -]+|[/. -]+$/g, '')
    .slice(0, 256)

  return sanitized || `worktree/${Date.now()}`
}

function parseNeonCreateOutput(output: string) {
  let parsed: unknown

  try {
    parsed = JSON.parse(output)
  } catch {
    fail('Neon did not return valid JSON while creating the branch.')
  }

  if (!isRecord(parsed)) {
    fail('Neon branch create output was not an object.')
  }

  const branch = parsed.branch
  if (!isRecord(branch) || typeof branch.id !== 'string') {
    fail('Neon branch create output did not include branch.id.')
  }

  return {
    branchId: branch.id,
    branchName: typeof branch.name === 'string' ? branch.name : branch.id,
  }
}

function extractConnectionString(output: string): string {
  const connectionString = output
    .split(/\s+/)
    .find((part) => /^postgres(?:ql)?:\/\//.test(part))

  if (!connectionString) {
    fail('Neon connection-string output did not include a Postgres URL.')
  }

  return connectionString
}

function envAssignment(key: string, value: string): string {
  return `${key}=${JSON.stringify(value)}`
}

function updateEnvValue(contents: string, key: string, value: string): string {
  const assignment = envAssignment(key, value)
  const pattern = new RegExp(`^(?:export\\s+)?${key}\\s*=.*$`, 'm')

  if (pattern.test(contents)) {
    return contents.replace(pattern, assignment)
  }

  const separator = contents.endsWith('\n') || contents.length === 0 ? '' : '\n'
  return `${contents}${separator}${assignment}\n`
}

function removeEnvValue(contents: string, key: string): string {
  const pattern = new RegExp(`^(?:export\\s+)?${key}\\s*=.*(?:\\n|$)`, 'm')
  return contents.replace(pattern, '')
}

function assertDirectory(path: string, label: string) {
  if (!existsSync(path)) fail(`${label} does not exist: ${path}`)
  if (!statSync(path).isDirectory()) fail(`${label} is not a directory: ${path}`)
}

function resolveDirectory(path: string, label: string): string {
  const resolvedPath = resolve(path)
  assertDirectory(resolvedPath, label)
  return realpathSync(resolvedPath)
}

function resolveTargetRoot(options: Options): string {
  if (!options.targetPath) fail('worktree-path is required.')

  return resolveDirectory(options.targetPath, 'Target worktree')
}

function setupWorktree(options: Options) {
  const targetRoot = resolveTargetRoot(options)
  const sourceRoot = resolveDirectory(sourceRepoPath, 'Source repo')
  const sourceEnvPath = join(sourceRoot, envFileName)
  const targetEnvPath = join(targetRoot, envFileName)

  if (sourceRoot === targetRoot) {
    fail('source repo and target worktree are the same.')
  }

  if (!existsSync(sourceEnvPath)) {
    fail(`source ${envFileName} does not exist: ${sourceEnvPath}`)
  }

  const targetGitTopLevel = realpathSync(getGitTopLevel(targetRoot))
  if (targetGitTopLevel !== targetRoot) {
    fail(`target path is inside a git worktree, but not at its root: ${targetRoot}`)
  }

  const sourceEnv = readEnv(sourceEnvPath)
  requireEnvValues(sourceEnv, sourceEnvPath)

  const databaseUrl = sourceEnv.CR_DATABASE_URL
  const projectId = sourceEnv.CR_NEON_PROJECT_ID
  const parentBranchId = sourceEnv.NEON_DEV_BRANCH_ID
  const database = parseDatabaseUrl(databaseUrl)
  const neonBranchName = sanitizeNeonBranchName(`worktree/${basename(targetRoot)}`)

  console.log(`Source env: ${sourceEnvPath}`)
  console.log(`Target env: ${targetEnvPath}`)
  console.log(`Neon parent branch: ${parentBranchId}`)
  console.log(`New Neon branch: ${neonBranchName}`)
  console.log(`Role/database: ${database.roleName}/${database.databaseName}`)

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
      projectId,
      '--parent',
      parentBranchId,
      '--name',
      neonBranchName,
      '--output',
      'json',
      '--color=false',
      '--analytics=false',
    ],
    sourceRoot,
  )
  const createdBranch = parseNeonCreateOutput(createOutput)

  const connectionStringOutput = commandOutput(
    'neon',
    [
      'connection-string',
      createdBranch.branchId,
      '--project-id',
      projectId,
      '--role-name',
      database.roleName,
      '--database-name',
      database.databaseName,
      '--endpoint-type',
      'read_write',
      '--ssl',
      database.sslMode,
      ...(database.pooled ? ['--pooled'] : []),
      '--color=false',
      '--analytics=false',
    ],
    sourceRoot,
  )
  const connectionString = extractConnectionString(connectionStringOutput)
  const targetEnvContents = readFileSync(targetEnvPath, 'utf8')
  const updatedTargetEnvContents = [
    ['CR_DATABASE_URL', connectionString],
    ['NEON_WORKTREE_BRANCH_ID', createdBranch.branchId],
  ].reduce(
    (contents, [key, value]) => updateEnvValue(contents, key, value),
    targetEnvContents,
  )

  writeFileSync(targetEnvPath, updatedTargetEnvContents)

  console.log(`Created Neon branch ${createdBranch.branchName} (${createdBranch.branchId}).`)
  console.log(`Updated CR_DATABASE_URL in ${targetEnvPath}.`)
}

function cleanupWorktree(options: Options) {
  const targetRoot = resolveTargetRoot(options)
  const targetEnvPath = join(targetRoot, envFileName)

  if (!existsSync(targetEnvPath)) {
    console.log(`No ${envFileName} found at ${targetEnvPath}; nothing to clean up.`)
    return
  }

  const targetEnv = readEnv(targetEnvPath)
  const projectId = targetEnv.CR_NEON_PROJECT_ID
  const branchId = targetEnv.NEON_WORKTREE_BRANCH_ID
  const parentBranchId = targetEnv.NEON_DEV_BRANCH_ID

  if (!branchId) {
    console.log(`No NEON_WORKTREE_BRANCH_ID found in ${targetEnvPath}; nothing to clean up.`)
    return
  }

  if (!projectId) fail(`CR_NEON_PROJECT_ID is missing from ${targetEnvPath}.`)
  if (branchId === parentBranchId) {
    fail('Refusing to delete NEON_WORKTREE_BRANCH_ID because it matches NEON_DEV_BRANCH_ID.')
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
    targetRoot,
  )

  const targetEnvContents = readFileSync(targetEnvPath, 'utf8')
  const cleanedTargetEnvContents = [
    'NEON_WORKTREE_BRANCH_ID',
  ].reduce((contents, key) => removeEnvValue(contents, key), targetEnvContents)

  writeFileSync(targetEnvPath, cleanedTargetEnvContents)

  console.log(`Deleted Neon branch ${branchId}.`)
  console.log(`Removed Neon worktree metadata from ${targetEnvPath}.`)
}

function main() {
  const options = parseArgs(process.argv.slice(2))

  if (options.mode === 'cleanup') {
    cleanupWorktree(options)
    return
  }

  setupWorktree(options)
}

main()
