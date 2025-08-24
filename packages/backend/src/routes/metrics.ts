import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq, sql, desc, gte, lte, and } from 'drizzle-orm'
import { schema } from '../config/index.js'
import { metricsQuerySchema } from '../schemas/index.js'
import type { TDatabase } from '../config/index.js'
import type { TMetricsResponse } from '../types.js'

type TBindings = {
  db: TDatabase
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
    
    const pageviewsResult = await database
      .select({ count: sql<number>`count(*)` })
      .from(schema.pageviews)
      .innerJoin(schema.sessions, eq(schema.pageviews.sessionId, schema.sessions.id))
      .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
      .where(and(
        eq(schema.users.projectId, projectId),
        startDate ? gte(schema.pageviews.timestamp, new Date(startDate)) : sql`true`,
        endDate ? lte(schema.pageviews.timestamp, new Date(endDate)) : sql`true`
      ))
    
    // For sessions, we need to join with pageviews to respect date filtering
    const sessionsResult = await database
      .select({ count: sql<number>`count(distinct ${schema.sessions.id})` })
      .from(schema.sessions)
      .innerJoin(schema.pageviews, eq(schema.sessions.id, schema.pageviews.sessionId))
      .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
      .where(and(
        eq(schema.users.projectId, projectId),
        startDate ? gte(schema.pageviews.timestamp, new Date(startDate)) : sql`true`,
        endDate ? lte(schema.pageviews.timestamp, new Date(endDate)) : sql`true`
      ))
    
    // For users, we need to join through sessions and pageviews
    const usersResult = await database
      .select({ count: sql<number>`count(distinct ${schema.users.id})` })
      .from(schema.users)
      .innerJoin(schema.sessions, eq(schema.users.id, schema.sessions.userId))
      .innerJoin(schema.pageviews, eq(schema.sessions.id, schema.pageviews.sessionId))
      .where(and(
        eq(schema.users.projectId, projectId),
        startDate ? gte(schema.pageviews.timestamp, new Date(startDate)) : sql`true`,
        endDate ? lte(schema.pageviews.timestamp, new Date(endDate)) : sql`true`
      ))
    
    const topPages = await database
      .select({
        url: schema.pageviews.url,
        count: sql<number>`count(*)`
      })
      .from(schema.pageviews)
      .innerJoin(schema.sessions, eq(schema.pageviews.sessionId, schema.sessions.id))
      .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
      .where(and(
        eq(schema.users.projectId, projectId),
        startDate ? gte(schema.pageviews.timestamp, new Date(startDate)) : sql`true`,
        endDate ? lte(schema.pageviews.timestamp, new Date(endDate)) : sql`true`
      ))
      .groupBy(schema.pageviews.url)
      .orderBy(desc(sql`count(*)`))
      .limit(5)
    
    const response: TMetricsResponse = {
      totals: {
        users: usersResult[0]?.count || 0,
        sessions: sessionsResult[0]?.count || 0,
        pageviews: pageviewsResult[0]?.count || 0,
        avgDuration: 0 // TODO: Calculate average duration
      },
      timeseries: [], // TODO: Implement timeseries data
      breakdowns: {
        topPages: topPages.map((p: any) => ({ url: p.url, views: p.count, avgDuration: 0 })),
        countries: [{ country: 'Netherlands', users: 5 }], // TODO: Get real data
        browsers: [{ browser: 'Chrome', users: 10 }], // TODO: Get real data
        devices: [{ device: 'Desktop', users: 8 }] // TODO: Get real data
      }
    }
    
    return c.json<TMetricsResponse>(response)
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    console.error('Metrics route error:', error)
    return c.json({ error: errorMessage }, 500)
  }
})