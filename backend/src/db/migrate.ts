import { config } from 'dotenv'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { migrate as migrateSqlite } from 'drizzle-orm/better-sqlite3/migrator'
import { db, getSchema } from './client.js'
import { eq } from 'drizzle-orm'

config()

async function runMigrations() {
  console.log('Running migrations...')
  
  try {
    const databaseUrl = process.env.DATABASE_URL
    
    if (databaseUrl?.startsWith('sqlite:')) {
      await migrateSqlite(db as any, { migrationsFolder: './migrations' })
    } else {
      await migrate(db as any, { migrationsFolder: './migrations' })
    }
    
    console.log('Migrations completed successfully!')
    
    await seedDefaultProject()
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

async function seedDefaultProject() {
  const schema = getSchema()
  const defaultApiKey = process.env.DEFAULT_API_KEY || 'dev-key-12345'
  
  try {
    const existingProject = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.apiKey, defaultApiKey))
      .limit(1)
    
    if (existingProject.length === 0) {
      await db.insert(schema.projects).values({
        name: 'Default Project',
        apiKey: defaultApiKey
      })
      
      console.log(`Seeded default project with API key: ${defaultApiKey}`)
    } else {
      console.log('Default project already exists')
    }
  } catch (error) {
    console.error('Seeding failed:', error)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
}
