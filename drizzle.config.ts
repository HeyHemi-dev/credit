import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

if (!process.env.CR_DATABASE_URL) config({ path: '.env.local' })

const databaseUrl = process.env.CR_DATABASE_URL
if (!databaseUrl) throw new Error('CR_DATABASE_URL is not set')

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  schemaFilter: ['public'],
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
})
