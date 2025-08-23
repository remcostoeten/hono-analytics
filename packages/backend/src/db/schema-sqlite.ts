import { 
  sqliteTable, 
  text, 
  integer, 
  blob, 
  real
} from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  apiKey: text('api_key').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull()
})

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  projectId: integer('project_id')
    .references(() => projects.id)
    .notNull(),
  firstSeen: integer('first_seen', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  lastSeen: integer('last_seen', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  device: text('device'),
  browser: text('browser'),
  os: text('os'),
  country: text('country'),
  city: text('city'),
  lat: real('lat'),
  lng: real('lng'),
  isDev: integer('is_dev', { mode: 'boolean' }).default(false).notNull()
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id)
    .notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
  referrer: text('referrer'),
  origin: text('origin')
})

export const pageviews = sqliteTable('pageviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id')
    .references(() => sessions.id)
    .notNull(),
  url: text('url').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  durationMs: integer('duration_ms')
})
