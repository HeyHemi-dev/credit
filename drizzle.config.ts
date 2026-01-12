import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'
import { ERROR } from '@/lib/errors'

// Load environment variables from .env.local
config({ path: '.env.local' })

if (!process.env.CR_DATABASE_URL) {
  throw ERROR.INVALID_STATE('Database URL is not set')
}

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.CR_DATABASE_URL,
  },
})
