import { readFileSync } from 'node:fs'
import { relative } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { config as loadDotenv } from 'dotenv'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const tanstackDevStylesFallback: Plugin = {
  name: 'tanstack-dev-styles-fallback',
  apply: 'serve',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (!req.url?.startsWith('/@tanstack-start/styles.css')) {
        next()
        return
      }

      res.statusCode = 200
      res.setHeader('Content-Type', 'text/css; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store')
      res.end('')
    })
  },
}

/**
 * TanStack Start/Nitro can request Vite boolean asset queries as `?raw=` or
 * `?url=` on LAN dev origins. Vite expects `?raw` / `?url`; without this shim
 * those files are parsed as JS and local iOS testing fails before the app boots.
 */
const viteBooleanQueryFallback: Plugin = {
  name: 'vite-boolean-query-fallback',
  enforce: 'pre',
  configResolved(config) {
    root = config.root
  },
  resolveId(source, importer, options) {
    const normalizedSource = normalizeBooleanQuery(source)

    if (normalizedSource === source) return null

    return this.resolve(normalizedSource, importer, {
      ...options,
      skipSelf: true,
    })
  },
  load(id) {
    const normalizedId = normalizeBooleanQuery(id)

    if (normalizedId === id) return null

    const [filePath, query = ''] = normalizedId.split('?')
    const params = query.split('&')
    const isRawImport = params.includes('raw')
    const isUrlImport = params.includes('url')

    if (isRawImport) {
      const source = readFileSync(filePath, 'utf8')
      return {
        code: `export default ${JSON.stringify(source)}`,
        map: null,
      }
    }

    if (isUrlImport) {
      const url = filePath.startsWith(root)
        ? `/${relative(root, filePath)}`
        : filePath

      return {
        code: `export default ${JSON.stringify(url)}`,
        map: null,
      }
    }

    return null
  },
}

let root = process.cwd()

function normalizeBooleanQuery(id: string) {
  const [path, query] = id.split('?')
  if (!query) return id

  const normalizedQuery = query
    .split('&')
    .map((param) => {
      if (param === 'raw=') return 'raw'
      if (param === 'url=') return 'url'
      if (param === 'inline=') return 'inline'
      return param
    })
    .join('&')

  if (normalizedQuery === query) return id
  return `${path}?${normalizedQuery}`
}

function formatMb(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(0)}MB`
}

function buildDiagnostics(): Plugin {
  return {
    name: 'build-diagnostics',
    apply: 'build',
    buildStart() {
      const envName = (this as any).environment?.name ?? 'unknown'
      const mu = process.memoryUsage()
      console.log(
        `[build-diagnostics] env=${envName} hook=buildStart rss=${formatMb(
          mu.rss,
        )} heapUsed=${formatMb(mu.heapUsed)} heapTotal=${formatMb(mu.heapTotal)}`,
      )
    },
    generateBundle(_options, bundle) {
      const envName = (this as any).environment?.name ?? 'unknown'

      const mu = process.memoryUsage()
      console.log(
        `[build-diagnostics] env=${envName} hook=generateBundle rss=${formatMb(
          mu.rss,
        )} heapUsed=${formatMb(mu.heapUsed)} heapTotal=${formatMb(mu.heapTotal)}`,
      )

      const moduleSizes = new Map<string, number>()
      const chunkSizes: Array<{ fileName: string; bytes: number }> = []

      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue

        chunkSizes.push({
          fileName: output.fileName,
          bytes: output.code.length,
        })

        for (const [id, mod] of Object.entries(output.modules)) {
          moduleSizes.set(
            id,
            (moduleSizes.get(id) ?? 0) + (mod.renderedLength ?? 0),
          )
        }
      }

      const topChunks = chunkSizes
        .sort((a, b) => b.bytes - a.bytes)
        .slice(0, 10)
        .map((c) => `${formatMb(c.bytes)} ${c.fileName}`)

      const topModules = Array.from(moduleSizes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([id, bytes]) => `${formatMb(bytes)} ${id}`)

      console.log(`[build-diagnostics] env=${envName} topChunks:`)
      for (const line of topChunks) console.log(`  - ${line}`)

      console.log(`[build-diagnostics] env=${envName} topModules:`)
      for (const line of topModules) console.log(`  - ${line}`)
    },
    closeBundle() {
      const envName = (this as any).environment?.name ?? 'unknown'
      const mu = process.memoryUsage()
      console.log(
        `[build-diagnostics] env=${envName} hook=closeBundle rss=${formatMb(
          mu.rss,
        )} heapUsed=${formatMb(mu.heapUsed)} heapTotal=${formatMb(mu.heapTotal)}`,
      )
    },
  }
}

function externalizeServerDeps(): Plugin {
  const externals = ['better-auth', 'drizzle-orm', '@neondatabase/serverless']

  const isExternal = (id: string) =>
    externals.some((dep) => id === dep || id.startsWith(`${dep}/`))

  return {
    name: 'externalize-server-deps',
    apply: 'build',
    config() {
      return {
        environments: {
          ssr: {
            build: {
              rollupOptions: {
                external: (id: string) => isExternal(id),
              },
            },
          },
        },
      }
    },
  }
}

const config = defineConfig(({ mode }) => {
  const isTest =
    mode === 'test' ||
    process.env.NODE_ENV === 'test' ||
    process.env.VITEST === 'true'
  const isBuildDiagnosticsEnabled = process.env.BUILD_DIAGNOSTICS === '1'

  if (isTest && !process.env.CR_DATABASE_URL) {
    loadDotenv({ path: '.env.local' })
  }

  return {
    plugins: [
      viteBooleanQueryFallback,
      // this is the plugin that enables path aliases
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tailwindcss(),
      tanstackStart({
        // Disable SPA mode to allow builds to complete
        // with tanstack start 1.132.0
        // spa: {
        //   enabled: true,
        // },
      }),

      viteReact(),
      externalizeServerDeps(),
      ...(!isTest ? [nitro()] : []),
      ...(isBuildDiagnosticsEnabled ? [buildDiagnostics()] : []),
      tanstackDevStylesFallback,
    ],
  }
})

export default config
