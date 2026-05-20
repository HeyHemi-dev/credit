import { spawnSync } from 'node:child_process'
import { z } from 'zod'

type CommandOptions = {
  cwd?: string
  failPrefix: string
}

export function fail(message: string, prefix: string): never {
  console.error(`${prefix}: ${message}`)
  process.exit(1)
}

export function requireEnv(key: string, failPrefix: string): string {
  const envResult = z.string().min(1).safeParse(process.env[key])
  if (!envResult.success) fail(`${key} is not set.`, failPrefix)

  return envResult.data
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
