import { config } from 'dotenv'
config() // Load environment variables

import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3'
import pg from 'pg'
import Database from 'better-sqlite3'
import * as pgSchema from './schema.js'
import * as sqliteSchema from './schema-sqlite.js'

type TDatabaseClient = ReturnType<typeof drizzlePg<typeof pgSchema>> | ReturnType<typeof drizzleSqlite<typeof sqliteSchema>>

function createDatabaseClient(): TDatabaseClient {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  if (databaseUrl.startsWith('sqlite:')) {
    const dbPath = databaseUrl.replace('sqlite:', '')
    const sqliteClient = new Database(dbPath)
    return drizzleSqlite(sqliteClient, { schema: sqliteSchema })
  }

  // Use standard PostgreSQL driver (works with all PostgreSQL databases including Neon)
  console.log('Using PostgreSQL driver for Neon database')
  const pgClient = new pg.Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  })

  return drizzlePg(pgClient, { schema: pgSchema })
}

export const db = createDatabaseClient()

export function getSchema() {
  const databaseUrl = process.env.DATABASE_URL
  
  if (databaseUrl?.startsWith('sqlite:')) {
    return sqliteSchema
  }
  
  return pgSchema
}

export type TDatabase = typeof db
