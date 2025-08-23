import { sql } from 'drizzle-orm'
import { 
  pgTable, 
  text, 
  integer, 
  timestamp, 
  boolean, 
  uuid, 
  serial, 
  real
} from 'drizzle-orm/pg-core'

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  apiKey: text('api_key').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: integer('project_id')
    .references(() => projects.id)
    .notNull(),
  firstSeen: timestamp('first_seen').defaultNow().notNull(),
  lastSeen: timestamp('last_seen').defaultNow().notNull(),
  device: text('device'),
  browser: text('browser'),
  os: text('os'),
  country: text('country'),
  city: text('city'),
  lat: real('lat'),
  lng: real('lng'),
  isDev: boolean('is_dev').default(false).notNull()
})

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  referrer: text('referrer'),
  origin: text('origin')
})

export const pageviews = pgTable('pageviews', {
  id: serial('id').primaryKey(),
  sessionId: uuid('session_id')
    .references(() => sessions.id)
    .notNull(),
  url: text('url').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  durationMs: integer('duration_ms')
})
