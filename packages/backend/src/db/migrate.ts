import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { eq } from 'drizzle-orm'
import { env, databaseConfig, schema } from '../config/index.js'

async function runMigrations() {
  console.log('Running migrations...')
  
  try {
    if (databaseConfig.driver !== 'postgresql') {
      throw new Error('Migrations only support PostgreSQL. Please use a PostgreSQL DATABASE_URL.')
    }
    
    // Always use PostgreSQL for migrations in production
    const pgClient = new pg.Pool({
      connectionString: databaseConfig.url,
      ssl: databaseConfig.ssl
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
  if (databaseConfig.driver !== 'postgresql') {
    throw new Error('Seeding only supports PostgreSQL. Please use a PostgreSQL DATABASE_URL.')
  }
  
  try {
    const pgClient = new pg.Pool({
      connectionString: databaseConfig.url,
      ssl: databaseConfig.ssl
    })
    const seedDb = drizzlePg(pgClient, { schema })
    
    const existingProject = await seedDb
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.apiKey, env.DEFAULT_API_KEY))
      .limit(1)
    
    if (existingProject.length === 0) {
      await seedDb.insert(schema.projects).values({
        name: 'Default Project',
        apiKey: env.DEFAULT_API_KEY
      })
      
      console.log(`Seeded default project with API key: ${env.DEFAULT_API_KEY}`)
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
