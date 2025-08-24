import { config } from 'dotenv'
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema.js'
import { eq } from 'drizzle-orm'

config()

async function seedSampleData() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL not set')
    process.exit(1)
  }

  console.log('🌱 Seeding sample analytics data...')
  
  try {
    const pgClient = new pg.Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
    const db = drizzlePg(pgClient, { schema })
    
    const defaultApiKey = process.env.DEFAULT_API_KEY || 'dev-key-12345'
    
    const project = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.apiKey, defaultApiKey))
      .limit(1)
    
    if (project.length === 0) {
      console.error('Default project not found. Run migrations first.')
      process.exit(1)
    }
    
    const projectId = project[0].id
    console.log(`📊 Using project: ${project[0].name} (ID: ${projectId})`)
    
    const sampleUsers = [
      { device: 'desktop', browser: 'Chrome 120', os: 'Windows 11', country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
      { device: 'mobile', browser: 'Safari 17', os: 'iOS 17', country: 'Germany', city: 'Berlin', lat: 52.5200, lng: 13.4050 },
      { device: 'desktop', browser: 'Firefox 118', os: 'macOS 14', country: 'United States', city: 'New York', lat: 40.7128, lng: -74.0060 },
      { device: 'tablet', browser: 'Safari 17', os: 'iPadOS 17', country: 'United Kingdom', city: 'London', lat: 51.5074, lng: -0.1278 },
      { device: 'mobile', browser: 'Chrome 120', os: 'Android 14', country: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522 }
    ]
    
    const samplePages = [
      '/',
      '/dashboard',
      '/settings',
      '/profile',
      '/docs',
      '/api-reference',
      '/getting-started',
      '/examples'
    ]
    
    const referrers = [
      'https://google.com',
      'https://github.com',
      'https://stackoverflow.com',
      'direct'
    ]
    
    const insertedUsers = []
    
    for (const userData of sampleUsers) {
      const userId = crypto.randomUUID()
      
      const user = await db.insert(schema.users).values({
        id: userId,
        projectId,
        device: userData.device,
        browser: userData.browser,
        os: userData.os,
        country: userData.country,
        city: userData.city,
        lat: userData.lat,
        lng: userData.lng,
        isDev: false
      }).returning()
      
      insertedUsers.push(user[0])
      console.log(`👤 Created user: ${userData.country} - ${userData.device}`)
    }
    
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    for (let i = 0; i < 50; i++) {
      const randomUser = insertedUsers[Math.floor(Math.random() * insertedUsers.length)]
      const randomPage = samplePages[Math.floor(Math.random() * samplePages.length)]
      const randomReferrer = referrers[Math.floor(Math.random() * referrers.length)]
      const randomTime = new Date(oneWeekAgo.getTime() + Math.random() * (now.getTime() - oneWeekAgo.getTime()))
      
      const sessionId = crypto.randomUUID()
      
      await db.insert(schema.sessions).values({
        id: sessionId,
        userId: randomUser.id,
        referrer: randomReferrer === 'direct' ? null : randomReferrer,
        origin: randomReferrer === 'direct' ? 'direct' : 'referral'
      })
      
      await db.insert(schema.pageviews).values({
        sessionId,
        url: randomPage,
        timestamp: randomTime,
        durationMs: Math.floor(Math.random() * 10000) + 1000
      })
    }
    
    console.log('✅ Sample data seeded successfully!')
    console.log(`📊 Created ${insertedUsers.length} users with 50 pageviews over the last week`)
    
    await pgClient.end()
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedSampleData()
}