import { spawnSync } from 'node:child_process'
import { z } from 'zod'

type CommandOptions = {
  cwd?: string
}

type EnvValues = Record<string, string | undefined>

export function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

export function requireEnv(
  key: string,
  env: EnvValues = process.env,
): string {
  const envResult = z.string().min(1).safeParse(env[key])
  if (!envResult.success) fail(`${key} is not set.`)

  return envResult.data
}

export function listProtectedBranchIds(
  // Worktree cleanup checks a target .env.local, while normal scripts use process.env.
  env: EnvValues = process.env,
): Array<string> {
  const protectedBranchIds = [
    requireEnv('NEON_DEV_BRANCH_ID', env),
    requireEnv('NEON_PROD_BRANCH_ID', env),
  ]

  return protectedBranchIds
}

export function isProtectedBranchId(
  branchId: string,
  env: EnvValues = process.env,
): boolean {
  const protectedBranchIds = listProtectedBranchIds(env)

  return protectedBranchIds.includes(branchId)
}

export function commandOutput(
  command: string,
  args: Array<string>,
  options: CommandOptions,
): string {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: 'utf8',
  })

  if (result.error) {
    if ('code' in result.error && result.error.code === 'ENOENT') {
      fail(`${command} was not found on PATH.`)
    }

    fail(`${command} failed.`)
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
