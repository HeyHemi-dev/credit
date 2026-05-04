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
  branchName?: string
  dryRun: boolean
  expiresAt?: string
  forceCopy: boolean
  sourcePath?: string
  targetPath?: string
}

type GitWorktree = {
  branch?: string
  path: string
}

const envFileName = '.env.local'
const requiredEnvKeys = [
  'CR_DATABASE_URL',
  'CR_NEON_PROJECT_ID',
  'NEON_DEV_BRANCH_ID',
] as const

function usage() {
  console.log(`Usage: pnpm worktree:setup [worktree-path] [options]

Copies .env.local from the main worktree, creates a Neon branch from NEON_DEV_BRANCH_ID,
and updates CR_DATABASE_URL in the target worktree.

Arguments:
  worktree-path              Existing git worktree to configure. Defaults to the current worktree.

Options:
  --source <path>            Source worktree that owns the canonical .env.local.
                             Defaults to the git worktree on refs/heads/main.
  --branch-name <name>       Neon branch name. Defaults to worktree/<git-branch-or-folder>.
  --expires-at <timestamp>   Optional Neon branch expiration timestamp, in RFC 3339 format.
  --force-copy               Re-copy .env.local even if the target already has one.
  --dry-run                  Print what would happen without copying, creating, or updating.
  --help                     Show this help.

Examples:
  git worktree add ../credit-new-flow -b new-flow
  pnpm worktree:setup ../credit-new-flow

  cd ../credit-new-flow
  pnpm worktree:setup --source ../credit --branch-name worktree/new-flow`)
}

function parseArgs(argv: Array<string>): Options {
  const options: Options = {
    dryRun: false,
    forceCopy: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (!arg) continue

    if (arg === '--help' || arg === '-h') {
      usage()
      process.exit(0)
    }

    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }

    if (arg === '--force-copy') {
      options.forceCopy = true
      continue
    }

    if (arg === '--source' || arg === '--branch-name' || arg === '--expires-at') {
      const value = argv[index + 1]
      if (!value || value.startsWith('--')) {
        fail(`${arg} requires a value.`)
      }

      if (arg === '--source') options.sourcePath = value
      if (arg === '--branch-name') options.branchName = value
      if (arg === '--expires-at') options.expiresAt = value
      index += 1
      continue
    }

    if (arg.startsWith('--')) {
      fail(`Unknown option: ${arg}`)
    }

    if (options.targetPath) {
      fail(`Unexpected extra argument: ${arg}`)
    }

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

function getWorktrees(cwd: string): Array<GitWorktree> {
  const output = gitOutput(['worktree', 'list', '--porcelain'], cwd)
  const worktrees: Array<GitWorktree> = []
  let current: GitWorktree | undefined

  for (const line of output.split('\n')) {
    if (!line.trim()) {
      if (current) {
        worktrees.push(current)
        current = undefined
      }
      continue
    }

    const [key, ...valueParts] = line.split(' ')
    const value = valueParts.join(' ')

    if (key === 'worktree') {
      if (current) worktrees.push(current)
      current = { path: value }
    }

    if (key === 'branch' && current) {
      current.branch = value
    }
  }

  if (current) worktrees.push(current)

  return worktrees
}

function findMainWorktree(cwd: string): string | undefined {
  const mainWorktree = getWorktrees(cwd).find(
    (worktree) => worktree.branch === 'refs/heads/main',
  )

  return mainWorktree?.path
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

function getCurrentGitBranch(cwd: string): string | undefined {
  const result = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    cwd,
    encoding: 'utf8',
  })

  if (result.status !== 0) return undefined

  const branch = result.stdout.trim()
  return branch && branch !== 'HEAD' ? branch : undefined
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

function assertDirectory(path: string, label: string) {
  if (!existsSync(path)) fail(`${label} does not exist: ${path}`)
  if (!statSync(path).isDirectory()) fail(`${label} is not a directory: ${path}`)
}

function resolveDirectory(path: string, label: string): string {
  const resolvedPath = resolve(path)
  assertDirectory(resolvedPath, label)
  return realpathSync(resolvedPath)
}

function main() {
  const options = parseArgs(process.argv.slice(2))
  const cwdTopLevel = realpathSync(getGitTopLevel(process.cwd()))
  const targetRoot = resolveDirectory(
    options.targetPath ?? cwdTopLevel,
    'Target worktree',
  )
  const sourceRoot = resolveDirectory(
    options.sourcePath ?? findMainWorktree(cwdTopLevel) ?? cwdTopLevel,
    'Source worktree',
  )
  const sourceEnvPath = join(sourceRoot, envFileName)
  const targetEnvPath = join(targetRoot, envFileName)

  if (sourceRoot === targetRoot) {
    fail(
      'source and target worktree are the same. Run this from the main repo with a worktree path, or pass --source from inside a worktree.',
    )
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
  const targetGitBranch = getCurrentGitBranch(targetRoot)
  const defaultNeonBranchName = sanitizeNeonBranchName(
    `worktree/${targetGitBranch ?? basename(targetRoot)}`,
  )
  const neonBranchName = sanitizeNeonBranchName(
    options.branchName ?? defaultNeonBranchName,
  )

  console.log(`Source env: ${sourceEnvPath}`)
  console.log(`Target env: ${targetEnvPath}`)
  console.log(`Neon parent branch: ${parentBranchId}`)
  console.log(`New Neon branch: ${neonBranchName}`)
  console.log(`Role/database: ${database.roleName}/${database.databaseName}`)

  if (options.dryRun) {
    console.log('Dry run: no files changed and no Neon branch created.')
    return
  }

  if (!existsSync(targetEnvPath) || options.forceCopy) {
    copyFileSync(sourceEnvPath, targetEnvPath)
    console.log(`Copied ${envFileName} to target worktree.`)
  } else {
    console.log(`Target ${envFileName} already exists; keeping it. Use --force-copy to refresh it.`)
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
      ...(options.expiresAt ? ['--expires-at', options.expiresAt] : []),
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
  writeFileSync(
    targetEnvPath,
    updateEnvValue(targetEnvContents, 'CR_DATABASE_URL', connectionString),
  )

  console.log(`Created Neon branch ${createdBranch.branchName} (${createdBranch.branchId}).`)
  console.log(`Updated CR_DATABASE_URL in ${targetEnvPath}.`)
}

main()
