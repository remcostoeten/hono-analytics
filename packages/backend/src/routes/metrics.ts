import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { schema } from '../config/index.js'
import { metricsQuerySchema } from '../schemas/index.js'
import type { TDatabase } from '../config/index.js'
import type { TMetricsResponse } from '../types.js'
import {
  getTotalCounts,
  getAverageDuration,
  getTimeseries,
  getTopPages,
  getCountriesBreakdown,
  getBrowsersBreakdown,
  getDevicesBreakdown
} from '../services/analytics.js'

type TBindings = {
  db: TDatabase
}

function calculateDateRange(startDate?: string, endDate?: string): { from: Date; to: Date } {
  const now = new Date()
  const defaultTo = now
  const defaultFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  return {
    from: startDate ? new Date(startDate) : defaultFrom,
    to: endDate ? new Date(endDate) : defaultTo
  }
}

export const metricsRoute = new Hono<{ Bindings: TBindings }>()

metricsRoute.get('/', zValidator('query', metricsQuerySchema), async (c) => {
  const apiKey = c.req.header('x-api-key')
  
  if (!apiKey) {
    return c.json({ error: 'API key required' }, 401)
  }
  
  const database = c.env.db
  const { start_date: startDate, end_date: endDate } = c.req.valid('query')
  
  try {
    const projectRecord = await database
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.apiKey, apiKey))
      .limit(1)
    
    if (projectRecord.length === 0) {
      return c.json({ error: 'Invalid API key' }, 401)
    }
    
    const [project] = projectRecord
    const projectId = project.id
    const dateRange = calculateDateRange(startDate, endDate)
    
    const [totals, avgDuration, timeseries, topPages, countries, browsers, devices] = await Promise.all([
      getTotalCounts(database, projectId, dateRange),
      getAverageDuration(database, projectId, dateRange),
      getTimeseries(database, projectId, dateRange),
      getTopPages(database, projectId, dateRange, 10),
      getCountriesBreakdown(database, projectId, dateRange, 10),
      getBrowsersBreakdown(database, projectId, dateRange, 10),
      getDevicesBreakdown(database, projectId, dateRange, 10)
    ])
    
    const response: TMetricsResponse = {
      totals: {
        users: totals.users,
        sessions: totals.sessions,
        pageviews: totals.pageviews,
        avgDuration
      },
      timeseries,
      breakdowns: {
        topPages,
        countries,
        browsers,
        devices
      }
    }
    
    return c.json<TMetricsResponse>(response)
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    console.error('Metrics route error:', error)
    return c.json({ error: errorMessage }, 500)
  }
})
