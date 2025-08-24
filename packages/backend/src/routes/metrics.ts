import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, gte, lte, sql, desc, count, countDistinct, avg, sum } from 'drizzle-orm'
import { getSchema } from '../db/client.js'
import { parseRange } from '../utils/helpers.js'
import type { TDatabase } from '../types.js'

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
    
    const devFilter = excludeDev ? eq(schema.users.isDev, false) : undefined
    
    const totalsQuery = db
      .select({
        users: countDistinct(schema.users.id),
        sessions: countDistinct(schema.sessions.id),
        pageviews: count(schema.pageviews.id),
        avgDuration: avg(schema.pageviews.durationMs)
      })
      .from(schema.users)
      .leftJoin(schema.sessions, eq(schema.users.id, schema.sessions.userId))
      .leftJoin(schema.pageviews, eq(schema.sessions.id, schema.pageviews.sessionId))
      .where(
        and(
          eq(schema.users.projectId, projectId),
          gte(schema.users.firstSeen, startDate),
          lte(schema.users.lastSeen, endDate),
          devFilter
        )
      )

    const totals = await totalsQuery

    const timeseriesQuery = db
      .select({
        date: sql<string>`DATE(${schema.pageviews.timestamp})`,
        users: countDistinct(schema.users.id),
        sessions: countDistinct(schema.sessions.id),
        pageviews: count(schema.pageviews.id)
      })
      .from(schema.pageviews)
      .leftJoin(schema.sessions, eq(schema.pageviews.sessionId, schema.sessions.id))
      .leftJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
      .where(
        and(
          eq(schema.users.projectId, projectId),
          gte(schema.pageviews.timestamp, startDate),
          lte(schema.pageviews.timestamp, endDate),
          devFilter
        )
      )
      .groupBy(sql`DATE(${schema.pageviews.timestamp})`)
      .orderBy(sql`DATE(${schema.pageviews.timestamp})`)

    const timeseries = await timeseriesQuery

    const topPagesQuery = db
      .select({
        url: schema.pageviews.url,
        views: count(schema.pageviews.id),
        avgDuration: avg(schema.pageviews.durationMs)
      })
      .from(schema.pageviews)
      .leftJoin(schema.sessions, eq(schema.pageviews.sessionId, schema.sessions.id))
      .leftJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
      .where(
        and(
          eq(schema.users.projectId, projectId),
          gte(schema.pageviews.timestamp, startDate),
          lte(schema.pageviews.timestamp, endDate),
          devFilter
        )
      )
      .groupBy(schema.pageviews.url)
      .orderBy(desc(count(schema.pageviews.id)))
      .limit(10)

    const topPages = await topPagesQuery

    const countriesQuery = db
      .select({
        country: schema.users.country,
        users: countDistinct(schema.users.id)
      })
      .from(schema.users)
      .where(
        and(
          eq(schema.users.projectId, projectId),
          gte(schema.users.firstSeen, startDate),
          lte(schema.users.lastSeen, endDate),
          devFilter,
          sql`${schema.users.country} IS NOT NULL`
        )
      )
      .groupBy(schema.users.country)
      .orderBy(desc(countDistinct(schema.users.id)))
      .limit(10)

    const countries = await countriesQuery

    const browsersQuery = db
      .select({
        browser: schema.users.browser,
        users: countDistinct(schema.users.id)
      })
      .from(schema.users)
      .where(
        and(
          eq(schema.users.projectId, projectId),
          gte(schema.users.firstSeen, startDate),
          lte(schema.users.lastSeen, endDate),
          devFilter,
          sql`${schema.users.browser} IS NOT NULL`
        )
      )
      .groupBy(schema.users.browser)
      .orderBy(desc(countDistinct(schema.users.id)))
      .limit(10)

    const browsers = await browsersQuery

    const devicesQuery = db
      .select({
        device: schema.users.device,
        users: countDistinct(schema.users.id)
      })
      .from(schema.users)
      .where(
        and(
          eq(schema.users.projectId, projectId),
          gte(schema.users.firstSeen, startDate),
          lte(schema.users.lastSeen, endDate),
          devFilter,
          sql`${schema.users.device} IS NOT NULL`
        )
      )
      .groupBy(schema.users.device)
      .orderBy(desc(countDistinct(schema.users.id)))
      .limit(10)

    const devices = await devicesQuery
    
    const response = {
      totals: {
        users: Number(totals[0]?.users || 0),
        sessions: Number(totals[0]?.sessions || 0),
        pageviews: Number(totals[0]?.pageviews || 0),
        avgDuration: Number(totals[0]?.avgDuration || 0)
      },
      timeseries: timeseries.map(row => ({
        date: row.date,
        users: Number(row.users),
        sessions: Number(row.sessions),
        pageviews: Number(row.pageviews)
      })),
      breakdowns: {
        topPages: topPages.map(row => ({
          url: row.url,
          views: Number(row.views),
          avgDuration: Number(row.avgDuration || 0)
        })),
        countries: countries.map(row => ({
          country: row.country || 'Unknown',
          users: Number(row.users)
        })),
        browsers: browsers.map(row => ({
          browser: row.browser || 'Unknown',
          users: Number(row.users)
        })),
        devices: devices.map(row => ({
          device: row.device || 'Unknown',
          users: Number(row.users)
        }))
      }
    }

    // If no real data exists, generate sample data for development
    if (response.totals.users === 0 && process.env.NODE_ENV === 'development') {
      response.totals = {
        users: 1250,
        sessions: 2100,
        pageviews: 5780,
        avgDuration: 2340
      }
      
      response.timeseries = generateSampleTimeseries(range)
      response.breakdowns = generateSampleBreakdowns()
    }
    
    return c.json(response)
    
  } catch (error) {
    console.error('Metrics route error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

function generateSampleTimeseries(range: string) {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const data = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    data.push({
      date: date.toISOString().split('T')[0],
      users: Math.floor(Math.random() * 100) + 20,
      sessions: Math.floor(Math.random() * 150) + 30,
      pageviews: Math.floor(Math.random() * 300) + 80
    })
  }
  
  return data
}

function generateSampleBreakdowns() {
  return {
    topPages: [
      { url: '/', views: 890, avgDuration: 3200 },
      { url: '/dashboard', views: 456, avgDuration: 2800 },
      { url: '/settings', views: 234, avgDuration: 1900 },
      { url: '/api-reference', views: 189, avgDuration: 4100 }
    ],
    countries: [
      { country: 'Netherlands', users: 456 },
      { country: 'Germany', users: 234 },
      { country: 'United States', users: 189 },
      { country: 'United Kingdom', users: 123 }
    ],
    browsers: [
      { browser: 'Chrome 120', users: 678 },
      { browser: 'Safari 17', users: 234 },
      { browser: 'Firefox 118', users: 156 },
      { browser: 'Edge 119', users: 89 }
    ],
    devices: [
      { device: 'desktop', users: 789 },
      { device: 'mobile', users: 461 },
      { device: 'tablet', users: 123 }
    ]
  }
}
