import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { config } from 'dotenv'
import { db } from './db/client.js'
import { trackRoute } from './routes/track.js'
import { metricsRoute } from './routes/metrics.js'
import type { TDatabase } from './db/client.js'

config()

type TBindings = {
  db: TDatabase
}

const app = new Hono<{ Bindings: TBindings }>()

app.use('*', cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:5173',
    'https://hono-analytics-docs.vercel.app'
  ],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-dev-traffic'],
  credentials: true
}))

app.use('*', logger())

app.use('*', async (c, next) => {
  c.env.db = db
  await next()
})

app.get('/', (c) => {
  return c.json({
    message: 'HONO Analytics API',
    version: '1.0.0',
    endpoints: {
      track: 'POST /track',
      metrics: 'GET /metrics'
    }
  })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.route('/track', trackRoute)
app.route('/metrics', metricsRoute)

export { app }

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = parseInt(process.env.PORT || '8000')
  
  console.log(`🚀 HONO Analytics API starting on port ${port}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🗄️  Database: ${process.env.DATABASE_URL?.split('://')[0] || 'unknown'}`)
  
  serve({
    fetch: app.fetch,
    port
  })
  
  console.log(`✅ Server running on http://localhost:${port}`)
}
