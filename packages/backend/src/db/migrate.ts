import { config } from 'dotenv'

// Load environment variables first
config()

import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { eq } from 'drizzle-orm'
import * as schema from './schema.js'

async function runMigrations() {
  console.log('Running migrations...')
  
  try {
    const databaseUrl = process.env.DATABASE_URL
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required')
    }
    
    // Always use PostgreSQL for migrations in production
    const pgClient = new pg.Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
    
    const migrationDb = drizzlePg(pgClient, { schema })
    await migrate(migrationDb, { migrationsFolder: './migrations' })
    await pgClient.end()
    
    console.log('Migrations completed successfully!')
    
    await seedDefaultProject()
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

async function seedDefaultProject() {
  const defaultApiKey = process.env.DEFAULT_API_KEY || 'dev-key-12345'
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required')
  }
  
  try {
    const pgClient = new pg.Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
    const seedDb = drizzlePg(pgClient, { schema })
    
    const existingProject = await seedDb
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.apiKey, defaultApiKey))
      .limit(1)
    
    if (existingProject.length === 0) {
      await seedDb.insert(schema.projects).values({
        name: 'Default Project',
        apiKey: defaultApiKey
      })
      
      console.log(`Seeded default project with API key: ${defaultApiKey}`)
    } else {
      console.log('Default project already exists')
    }
    
    await pgClient.end()
  } catch (error) {
    console.error('Seeding failed:', error)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
}
