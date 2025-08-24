import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import type { projects, users, sessions, pageviews } from './db/schema.js'

export type TProject = InferSelectModel<typeof projects>
export type TUser = InferSelectModel<typeof users>
export type TSession = InferSelectModel<typeof sessions>
export type TPageview = InferSelectModel<typeof pageviews>

export type TInsertProject = InferInsertModel<typeof projects>
export type TInsertUser = InferInsertModel<typeof users>
export type TInsertSession = InferInsertModel<typeof sessions>
export type TInsertPageview = InferInsertModel<typeof pageviews>

export type TTrackingPayload = {
  user: {
    id?: string
    device?: string
    browser?: string
    os?: string
    country?: string
    city?: string
    lat?: number
    lng?: number
  }
  session: {
    id?: string
    referrer?: string
    origin?: string
  }
  pageview: {
    url: string
    timestamp?: string
    durationMs?: number
  }
}

export type TMetricsQuery = {
  project?: string
  range?: string
  exclude_dev?: string
}

export type TMetricsResponse = {
  totals: {
    users: number
    sessions: number
    pageviews: number
    avgDuration: number
  }
  timeseries: Array<{
    date: string
    users: number
    sessions: number
    pageviews: number
  }>
  breakdowns: {
    topPages: Array<{
      url: string
      views: number
      avgDuration: number
    }>
    countries: Array<{
      country: string
      users: number
    }>
    browsers: Array<{
      browser: string
      users: number
    }>
    devices: Array<{
      device: string
      users: number
    }>
  }
}

export type TEnvironmentVariables = {
  NODE_ENV: string
  PORT: string
  DATABASE_URL: string
  DEFAULT_API_KEY: string
  LOG_LEVEL?: string
}

export type TError = {
  message: string
}
