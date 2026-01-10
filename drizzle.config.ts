import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

if (!process.env.CR_DATABASE_URL) {
  throw new Error('Database URL is not set')
}

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.CR_DATABASE_URL,
  },
})
