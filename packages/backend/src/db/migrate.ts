import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator'
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import { migrate as migrateSqlite } from 'drizzle-orm/better-sqlite3/migrator'
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3'
import pg from 'pg'
import Database from 'better-sqlite3'
import { eq } from 'drizzle-orm'
import { env } from '../config/env.js'
import * as pgSchema from '../db/schema.js'
import * as sqliteSchema from '../db/schema-sqlite.js'

type TDatabaseConfig = {
  url: string
  ssl: boolean | { rejectUnauthorized: boolean }
  driver: 'postgresql' | 'sqlite'
}

function getDatabaseConfig(): TDatabaseConfig {
  const url = env.DATABASE_URL
  const isProd = env.NODE_ENV === 'production'
  if (url.startsWith('sqlite:')) {
    return { url, ssl: false, driver: 'sqlite' }
  }
  return { url, ssl: isProd ? { rejectUnauthorized: false } : false, driver: 'postgresql' }
}

const databaseConfig = getDatabaseConfig()
const migrationsFolder = databaseConfig.driver === 'postgresql' ? './migrations/pg' : './migrations/sqlite'

async function runPostgresMigrations() {
  const pgClient = new pg.Pool({
    connectionString: databaseConfig.url,
    ssl: databaseConfig.ssl
  })
  const migrationDb = drizzlePg(pgClient, { schema: pgSchema })
  await migratePg(migrationDb, { migrationsFolder })
  await pgClient.end()
}

async function runSqliteMigrations() {
  const dbPath = databaseConfig.url.replace('sqlite:', '')
  const { dirname } = await import('path')
  const { mkdirSync, existsSync } = await import('fs')
  const dir = dirname(dbPath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  const sqliteClient = new Database(dbPath)
  const migrationDb = drizzleSqlite(sqliteClient, { schema: sqliteSchema }) as any
  await migrateSqlite(migrationDb, { migrationsFolder })
}

async function seedDefaultProject() {
  if (databaseConfig.driver === 'postgresql') {
    const pgClient = new pg.Pool({ connectionString: databaseConfig.url, ssl: databaseConfig.ssl })
    const db = drizzlePg(pgClient, { schema: pgSchema })
    const existingProject = await db
      .select()
      .from(pgSchema.projects)
      .where(eq(pgSchema.projects.apiKey, env.DEFAULT_API_KEY))
      .limit(1)
    if (existingProject.length === 0) {
      await db.insert(pgSchema.projects).values({ name: 'Default Project', apiKey: env.DEFAULT_API_KEY })
      console.log(`Seeded default project with API key: ${env.DEFAULT_API_KEY}`)
    } else {
      console.log('Default project already exists')
    }
    await pgClient.end()
    return
  }
  const dbPath = databaseConfig.url.replace('sqlite:', '')
  const { dirname } = await import('path')
  const { mkdirSync, existsSync } = await import('fs')
  const dir = dirname(dbPath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  const sqliteClient = new Database(dbPath)
  const db = drizzleSqlite(sqliteClient, { schema: sqliteSchema }) as any
  const existingProject = await db
    .select()
    .from(sqliteSchema.projects)
    .where(eq(sqliteSchema.projects.apiKey, env.DEFAULT_API_KEY))
    .limit(1)
  if (existingProject.length === 0) {
    await db.insert(sqliteSchema.projects).values({ name: 'Default Project', apiKey: env.DEFAULT_API_KEY })
    console.log(`Seeded default project with API key: ${env.DEFAULT_API_KEY}`)
  } else {
    console.log('Default project already exists')
  }
}

async function runMigrations() {
  console.log('Running migrations...')
  try {
    if (databaseConfig.driver === 'postgresql') {
      await runPostgresMigrations()
    } else {
      await runSqliteMigrations()
    }
    console.log('Migrations completed successfully!')
    await seedDefaultProject()
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
}
