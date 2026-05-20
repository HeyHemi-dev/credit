import { spawnSync } from 'node:child_process'
import { z } from 'zod'

type CommandOptions = {
  cwd?: string
  failPrefix: string
}

type EnvValues = Record<string, string | undefined>

export function fail(message: string, prefix: string): never {
  console.error(`${prefix}: ${message}`)
  process.exit(1)
}

export function requireEnv(key: string, failPrefix = 'script failed'): string {
  const envResult = z.string().min(1).safeParse(process.env[key])
  if (!envResult.success) fail(`${key} is not set.`, failPrefix)

  return envResult.data
}

function requireEnvFrom(env: EnvValues, key: string, failPrefix = 'script failed'): string {
  const envResult = z.string().min(1).safeParse(env[key])
  if (!envResult.success) fail(`${key} is not set.`, failPrefix)

  return envResult.data
}

export function listProtectedBranchIds(
  env: EnvValues = process.env,
): Array<string> {
  const protectedBranchIds = [
    requireEnvFrom(env, 'NEON_DEV_BRANCH_ID'),
    requireEnvFrom(env, 'NEON_PROD_BRANCH_ID'),
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
      fail(`${command} was not found on PATH.`, options.failPrefix)
    }

    fail(`${command} failed.`, options.failPrefix)
  }

  if (result.status !== 0) {
    const details = (result.stderr || result.stdout).trim()
    fail(
      details
        ? `${command} ${args.join(' ')} exited with ${result.status}:\n${details}`
        : `${command} ${args.join(' ')} exited with ${result.status}.`,
      options.failPrefix,
    )
  }

  return result.stdout.trim()
}
