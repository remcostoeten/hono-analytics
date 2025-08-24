import { 
  sqliteTable, 
  text, 
  integer, 
  real,
  index,
  uniqueIndex
} from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

function generateUUID() {
  return sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`
}

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  domain: text('domain'),
  apiKey: text('api_key').notNull().unique(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull()
}, (table) => {
  return {
    apiKeyIdx: uniqueIndex('projects_api_key_idx').on(table.apiKey),
    domainIdx: index('projects_domain_idx').on(table.domain)
  }
})

export const users = sqliteTable('users', {
  id: text('id').primaryKey().default(generateUUID()),
  projectId: integer('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  fingerprint: text('fingerprint'),
  firstSeen: integer('first_seen', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  lastSeen: integer('last_seen', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  device: text('device'),
  browser: text('browser'),
  browserVersion: text('browser_version'),
  os: text('os'),
  osVersion: text('os_version'),
  country: text('country'),
  region: text('region'),
  city: text('city'),
  lat: real('lat'),
  lng: real('lng'),
  timezone: text('timezone'),
  language: text('language'),
  isDev: integer('is_dev', { mode: 'boolean' }).default(false).notNull()
}, (table) => {
  return {
    projectIdx: index('users_project_id_idx').on(table.projectId),
    fingerprintIdx: index('users_fingerprint_idx').on(table.fingerprint),
    lastSeenIdx: index('users_last_seen_idx').on(table.lastSeen)
  }
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().default(generateUUID()),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
  duration: integer('duration'),
  pageCount: integer('page_count').default(0).notNull(),
  referrer: text('referrer'),
  referrerDomain: text('referrer_domain'),
  landingPage: text('landing_page'),
  exitPage: text('exit_page'),
  origin: text('origin'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  utmTerm: text('utm_term'),
  utmContent: text('utm_content'),
  deviceType: text('device_type')
}, (table) => {
  return {
    userIdx: index('sessions_user_id_idx').on(table.userId),
    startedAtIdx: index('sessions_started_at_idx').on(table.startedAt),
    endedAtIdx: index('sessions_ended_at_idx').on(table.endedAt)
  }
})

export const pageviews = sqliteTable('pageviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  url: text('url').notNull(),
  path: text('path').notNull(),
  queryParams: text('query_params'),
  hash: text('hash'),
  title: text('title'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  timeOnPage: integer('time_on_page'),
  scrollDepth: integer('scroll_depth'),
  clicks: integer('clicks').default(0).notNull(),
  isExit: integer('is_exit', { mode: 'boolean' }).default(false).notNull()
}, (table) => {
  return {
    sessionIdx: index('pageviews_session_id_idx').on(table.sessionId),
    timestampIdx: index('pageviews_timestamp_idx').on(table.timestamp),
    pathIdx: index('pageviews_path_idx').on(table.path)
  }
})

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  category: text('category'),
  action: text('action'),
  label: text('label'),
  value: real('value'),
  properties: text('properties'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull()
}, (table) => {
  return {
    sessionIdx: index('events_session_id_idx').on(table.sessionId),
    nameIdx: index('events_name_idx').on(table.name),
    timestampIdx: index('events_timestamp_idx').on(table.timestamp)
  }
})
