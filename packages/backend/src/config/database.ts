import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3'
import pg from 'pg'
import Database from 'better-sqlite3'
import * as schema from '../db/schema.js'
import * as sqliteSchema from '../db/schema-sqlite.js'
import { env, isProduction } from './env.js'

type TDatabaseConfig = {
  url: string
  ssl: boolean | { rejectUnauthorized: boolean }
  driver: 'postgresql' | 'sqlite'
}

function getDatabaseConfig(): TDatabaseConfig {
  const url = env.DATABASE_URL
  
  if (url.startsWith('sqlite:')) {
    return {
      url,
      ssl: false,
      driver: 'sqlite'
    }
  }

  return {
    url,
    ssl: isProduction() ? { rejectUnauthorized: false } : false,
    driver: 'postgresql'
  }
}

function createPostgreSQLClient(config: TDatabaseConfig) {
  console.log(`Using PostgreSQL driver for ${env.NODE_ENV}`)
  const pgClient = new pg.Pool({
    connectionString: config.url,
    ssl: config.ssl
  })
  return drizzlePg(pgClient, { schema })
}

function createSQLiteClient(config: TDatabaseConfig) {
  console.log(`Using SQLite driver for ${env.NODE_ENV}`)
  const dbPath = config.url.replace('sqlite:', '')
  const sqliteClient = new Database(dbPath)
  return drizzleSqlite(sqliteClient, { schema: sqliteSchema }) as any
}

function createDatabaseClient() {
  const config = getDatabaseConfig()
  
  if (isProduction() && config.driver === 'sqlite') {
    console.warn('Warning: SQLite is not recommended for production. Consider using PostgreSQL.')
  }
  
  return config.driver === 'sqlite' 
    ? createSQLiteClient(config)
    : createPostgreSQLClient(config)
}

export const databaseConfig = getDatabaseConfig()
export const db = createDatabaseClient()
export { schema }
export type TDatabase = ReturnType<typeof createPostgreSQLClient>
