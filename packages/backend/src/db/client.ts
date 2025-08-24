import { config } from 'dotenv'
config() // Load environment variables

import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3'
import pg from 'pg'
import Database from 'better-sqlite3'
import * as schema from './schema.js'
import * as sqliteSchema from './schema-sqlite.js'

// For production, we only use PostgreSQL
const isProd = process.env.NODE_ENV === 'production'
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Production always uses PostgreSQL
function createProductionClient() {
  console.log('Using PostgreSQL driver for production')
  const pgClient = new pg.Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  })
  return drizzlePg(pgClient, { schema })
}

// Development can use SQLite or PostgreSQL
function createDevelopmentClient() {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }
  
  if (databaseUrl.startsWith('sqlite:')) {
    const dbPath = databaseUrl.replace('sqlite:', '')
    const sqliteClient = new Database(dbPath)
    // Type assertion for development only
    return drizzleSqlite(sqliteClient, { schema: sqliteSchema }) as any
  }
  
  const pgClient = new pg.Pool({
    connectionString: databaseUrl,
    ssl: false
  })
  return drizzlePg(pgClient, { schema })
}

// Export the correct client based on environment
export const db = isProd ? createProductionClient() : createDevelopmentClient()

// Export schema directly for production, avoiding union types
export { schema }

// Type export for the database client
export type TDatabase = ReturnType<typeof createProductionClient>
