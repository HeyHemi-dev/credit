import { defineConfig } from 'drizzle-kit'
import { CR_DATABASE_URL } from '@/lib/env'

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  schemaFilter: ['public'],
  dialect: 'postgresql',
  dbCredentials: {
    url: CR_DATABASE_URL,
  },
})
