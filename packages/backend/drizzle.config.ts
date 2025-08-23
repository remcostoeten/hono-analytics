import type { Config } from 'drizzle-kit'
import { config } from 'dotenv'

config()

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required')
}

const isPostgres = !databaseUrl.startsWith('sqlite:')

export default {
  schema: isPostgres ? './src/db/schema.ts' : './src/db/schema-sqlite.ts',
  out: './migrations',
  dialect: isPostgres ? 'postgresql' : 'sqlite',
  dbCredentials: isPostgres 
    ? { url: databaseUrl }
    : { url: databaseUrl.replace('sqlite:', '') }
} satisfies Config
