import { eq, sql, desc, gte, lte, and, count } from 'drizzle-orm'
import type { TDatabase } from '../config/index.js'
import { schema } from '../config/index.js'

type TDateRange = {
  from: Date
  to: Date
}

type TTimeseriesDatapoint = {
  date: string
  users: number
  sessions: number
  pageviews: number
}

type TTopPage = {
  url: string
  views: number
  avgDuration: number
}

type TCountryBreakdown = {
  country: string
  users: number
}

type TBrowserBreakdown = {
  browser: string
  users: number
}

type TDeviceBreakdown = {
  device: string
  users: number
}

export async function getAverageDuration(
  db: TDatabase,
  projectId: number,
  range: TDateRange
): Promise<number> {
  const result = await db
    .select({
      avgDuration: sql<number>`COALESCE(AVG(${schema.pageviews.timeOnPage}), 0)`
    })
    .from(schema.pageviews)
    .innerJoin(schema.sessions, eq(schema.pageviews.sessionId, schema.sessions.id))
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(
      and(
        eq(schema.users.projectId, projectId),
        gte(schema.pageviews.timestamp, range.from),
        lte(schema.pageviews.timestamp, range.to)
      )
    )

  return Math.round(result[0]?.avgDuration || 0)
}

export async function getTimeseries(
  db: TDatabase,
  projectId: number,
  range: TDateRange
): Promise<TTimeseriesDatapoint[]> {
  const pageviewsSeries = await db
    .select({
      date: sql<string>`DATE(${schema.pageviews.timestamp})`,
      pageviews: sql<number>`COUNT(*)`,
      sessions: sql<number>`COUNT(DISTINCT ${schema.sessions.id})`,
      users: sql<number>`COUNT(DISTINCT ${schema.users.id})`
    })
    .from(schema.pageviews)
    .innerJoin(schema.sessions, eq(schema.pageviews.sessionId, schema.sessions.id))
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(
      and(
        eq(schema.users.projectId, projectId),
        gte(schema.pageviews.timestamp, range.from),
        lte(schema.pageviews.timestamp, range.to)
      )
    )
    .groupBy(sql`DATE(${schema.pageviews.timestamp})`)
    .orderBy(sql`DATE(${schema.pageviews.timestamp})`)

  return pageviewsSeries.map(row => ({
    date: row.date,
    users: row.users,
    sessions: row.sessions,
    pageviews: row.pageviews
  }))
}

export async function getTopPages(
  db: TDatabase,
  projectId: number,
  range: TDateRange,
  limit: number = 10
): Promise<TTopPage[]> {
  const result = await db
    .select({
      url: schema.pageviews.url,
      views: sql<number>`COUNT(*)`,
      avgDuration: sql<number>`COALESCE(AVG(${schema.pageviews.timeOnPage}), 0)`
    })
    .from(schema.pageviews)
    .innerJoin(schema.sessions, eq(schema.pageviews.sessionId, schema.sessions.id))
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(
      and(
        eq(schema.users.projectId, projectId),
        gte(schema.pageviews.timestamp, range.from),
        lte(schema.pageviews.timestamp, range.to)
      )
    )
    .groupBy(schema.pageviews.url)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(limit)

  return result.map(row => ({
    url: row.url,
    views: row.views,
    avgDuration: Math.round(row.avgDuration)
  }))
}

export async function getCountriesBreakdown(
  db: TDatabase,
  projectId: number,
  range: TDateRange,
  limit: number = 10
): Promise<TCountryBreakdown[]> {
  const result = await db
    .select({
      country: schema.users.country,
      users: sql<number>`COUNT(DISTINCT ${schema.users.id})`
    })
    .from(schema.users)
    .innerJoin(schema.sessions, eq(schema.users.id, schema.sessions.userId))
    .innerJoin(schema.pageviews, eq(schema.sessions.id, schema.pageviews.sessionId))
    .where(
      and(
        eq(schema.users.projectId, projectId),
        gte(schema.pageviews.timestamp, range.from),
        lte(schema.pageviews.timestamp, range.to),
        sql`${schema.users.country} IS NOT NULL`,
        sql`${schema.users.country} != ''`
      )
    )
    .groupBy(schema.users.country)
    .orderBy(desc(sql`COUNT(DISTINCT ${schema.users.id})`))
    .limit(limit)

  return result.map(row => ({
    country: row.country || 'Unknown',
    users: row.users
  }))
}

export async function getBrowsersBreakdown(
  db: TDatabase,
  projectId: number,
  range: TDateRange,
  limit: number = 10
): Promise<TBrowserBreakdown[]> {
  const result = await db
    .select({
      browser: schema.users.browser,
      users: sql<number>`COUNT(DISTINCT ${schema.users.id})`
    })
    .from(schema.users)
    .innerJoin(schema.sessions, eq(schema.users.id, schema.sessions.userId))
    .innerJoin(schema.pageviews, eq(schema.sessions.id, schema.pageviews.sessionId))
    .where(
      and(
        eq(schema.users.projectId, projectId),
        gte(schema.pageviews.timestamp, range.from),
        lte(schema.pageviews.timestamp, range.to),
        sql`${schema.users.browser} IS NOT NULL`,
        sql`${schema.users.browser} != ''`
      )
    )
    .groupBy(schema.users.browser)
    .orderBy(desc(sql`COUNT(DISTINCT ${schema.users.id})`))
    .limit(limit)

  return result.map(row => ({
    browser: row.browser || 'Unknown',
    users: row.users
  }))
}

export async function getDevicesBreakdown(
  db: TDatabase,
  projectId: number,
  range: TDateRange,
  limit: number = 10
): Promise<TDeviceBreakdown[]> {
  const result = await db
    .select({
      device: schema.users.device,
      users: sql<number>`COUNT(DISTINCT ${schema.users.id})`
    })
    .from(schema.users)
    .innerJoin(schema.sessions, eq(schema.users.id, schema.sessions.userId))
    .innerJoin(schema.pageviews, eq(schema.sessions.id, schema.pageviews.sessionId))
    .where(
      and(
        eq(schema.users.projectId, projectId),
        gte(schema.pageviews.timestamp, range.from),
        lte(schema.pageviews.timestamp, range.to),
        sql`${schema.users.device} IS NOT NULL`,
        sql`${schema.users.device} != ''`
      )
    )
    .groupBy(schema.users.device)
    .orderBy(desc(sql`COUNT(DISTINCT ${schema.users.id})`))
    .limit(limit)

  return result.map(row => ({
    device: row.device || 'Unknown',
    users: row.users
  }))
}

export async function getTotalCounts(
  db: TDatabase,
  projectId: number,
  range: TDateRange
): Promise<{ users: number; sessions: number; pageviews: number }> {
  const pageviewsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.pageviews)
    .innerJoin(schema.sessions, eq(schema.pageviews.sessionId, schema.sessions.id))
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(
      and(
        eq(schema.users.projectId, projectId),
        gte(schema.pageviews.timestamp, range.from),
        lte(schema.pageviews.timestamp, range.to)
      )
    )

  const sessionsResult = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${schema.sessions.id})` })
    .from(schema.sessions)
    .innerJoin(schema.pageviews, eq(schema.sessions.id, schema.pageviews.sessionId))
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(
      and(
        eq(schema.users.projectId, projectId),
        gte(schema.pageviews.timestamp, range.from),
        lte(schema.pageviews.timestamp, range.to)
      )
    )

  const usersResult = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${schema.users.id})` })
    .from(schema.users)
    .innerJoin(schema.sessions, eq(schema.users.id, schema.sessions.userId))
    .innerJoin(schema.pageviews, eq(schema.sessions.id, schema.pageviews.sessionId))
    .where(
      and(
        eq(schema.users.projectId, projectId),
        gte(schema.pageviews.timestamp, range.from),
        lte(schema.pageviews.timestamp, range.to)
      )
    )

  return {
    users: usersResult[0]?.count || 0,
    sessions: sessionsResult[0]?.count || 0,
    pageviews: pageviewsResult[0]?.count || 0
  }
}
