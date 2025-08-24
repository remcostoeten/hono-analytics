import {
  pgTable, 
  text, 
  integer, 
  timestamp, 
  boolean, 
  uuid, 
  serial, 
  real,
  index,
  uniqueIndex
} from 'drizzle-orm/pg-core'

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  domain: text('domain'),
  apiKey: text('api_key').notNull().unique(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => {
  return {
    apiKeyIdx: uniqueIndex('projects_api_key_idx').on(table.apiKey),
    domainIdx: index('projects_domain_idx').on(table.domain)
  }
})

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: integer('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  fingerprint: text('fingerprint'),
  firstSeen: timestamp('first_seen').defaultNow().notNull(),
  lastSeen: timestamp('last_seen').defaultNow().notNull(),
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
  isDev: boolean('is_dev').default(false).notNull()
}, (table) => {
  return {
    projectIdx: index('users_project_id_idx').on(table.projectId),
    fingerprintIdx: index('users_fingerprint_idx').on(table.fingerprint),
    lastSeenIdx: index('users_last_seen_idx').on(table.lastSeen)
  }
})

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
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

export const pageviews = pgTable('pageviews', {
  id: serial('id').primaryKey(),
  sessionId: uuid('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  url: text('url').notNull(),
  path: text('path').notNull(),
  queryParams: text('query_params'),
  hash: text('hash'),
  title: text('title'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  timeOnPage: integer('time_on_page'),
  scrollDepth: integer('scroll_depth'),
  clicks: integer('clicks').default(0).notNull(),
  isExit: boolean('is_exit').default(false).notNull()
}, (table) => {
  return {
    sessionIdx: index('pageviews_session_id_idx').on(table.sessionId),
    timestampIdx: index('pageviews_timestamp_idx').on(table.timestamp),
    pathIdx: index('pageviews_path_idx').on(table.path)
  }
})

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  sessionId: uuid('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  category: text('category'),
  action: text('action'),
  label: text('label'),
  value: real('value'),
  properties: text('properties'),
  timestamp: timestamp('timestamp').defaultNow().notNull()
}, (table) => {
  return {
    sessionIdx: index('events_session_id_idx').on(table.sessionId),
    nameIdx: index('events_name_idx').on(table.name),
    timestampIdx: index('events_timestamp_idx').on(table.timestamp)
  }
})
