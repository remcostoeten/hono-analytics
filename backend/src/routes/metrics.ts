import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, gte, lte, sql, desc, count, countDistinct, avg } from 'drizzle-orm'
import { getSchema } from '../db/client.js'
import { parseRange } from '../utils/helpers.js'
import type { TDatabase } from '../db/client.js'
import type { TMetricsResponse } from '../types.js'

const metricsQuerySchema = z.object({
  project: z.string().optional(),
  range: z.string().optional().default('7d'),
  exclude_dev: z.string().optional().default('true')
})

type TBindings = {
  db: TDatabase
}

export const metricsRoute = new Hono<{ Bindings: TBindings }>()

metricsRoute.get('/', zValidator('query', metricsQuerySchema), async (c) => {
  const { project, range, exclude_dev } = c.req.valid('query')
  const apiKey = c.req.header('x-api-key')
  
  if (!apiKey) {
    return c.json({ error: 'API key required' }, 401)
  }
  
  const schema = getSchema()
  const db = c.env.db
  
  try {
    const projectRecord = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.apiKey, apiKey))
      .limit(1)
    
    if (projectRecord.length === 0) {
      return c.json({ error: 'Invalid API key' }, 401)
    }
    
    const projectId = projectRecord[0].id
    const { startDate, endDate } = parseRange(range)
    const excludeDev = exclude_dev === 'true'
    
    const response: TMetricsResponse = {
      totals: {
        users: 0,
        sessions: 0,
        pageviews: 0,
        avgDuration: 0
      },
      timeseries: [],
      breakdowns: {
        topPages: [],
        countries: [],
        browsers: [],
        devices: []
      }
    }
    
    return c.json(response)
    
  } catch (error) {
    console.error('Metrics route error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})
