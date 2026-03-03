import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const tanstackDevStylesFallback = {
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

const config = defineConfig({
  plugins: [
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
    tanstackDevStylesFallback,
    nitro(),
    viteReact(),
  ],
})

export default config
