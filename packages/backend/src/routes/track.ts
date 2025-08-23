import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { getSchema } from '../db/client.js'
import { 
  parseUserAgent, 
  isDevTraffic, 
  generateUserId, 
  generateSessionId, 
  parseOrigin 
} from '../utils/helpers.js'
import type { TDatabase } from '../db/client.js'
import type { TTrackingPayload } from '../types.js'

const trackSchema = z.object({
  user: z.object({
    id: z.string().optional(),
    device: z.string().optional(),
    browser: z.string().optional(),
    os: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional()
  }),
  session: z.object({
    id: z.string().optional(),
    referrer: z.string().optional(),
    origin: z.string().optional()
  }),
  pageview: z.object({
    url: z.string(),
    timestamp: z.string().optional(),
    durationMs: z.number().optional()
  })
})

type TBindings = {
  db: TDatabase
}

export const trackRoute = new Hono<{ Bindings: TBindings }>()

trackRoute.post('/', zValidator('json', trackSchema), async (c) => {
  const payload = c.req.valid('json')
  const apiKey = c.req.header('x-api-key')
  const devHeader = c.req.header('x-dev-traffic')
  const host = c.req.header('host')
  const userAgent = c.req.header('user-agent') || ''
  
  if (!apiKey) {
    return c.json({ error: 'API key required' }, 401)
  }
  
  const schema = getSchema()
  const db = c.env.db
  
  try {
    const project = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.apiKey, apiKey))
      .limit(1)
    
    if (project.length === 0) {
      return c.json({ error: 'Invalid API key' }, 401)
    }
    
    const projectId = project[0].id
    const isDev = isDevTraffic(host, devHeader)
    
    const userAgentInfo = parseUserAgent(userAgent)
    const origin = parseOrigin(payload.session.referrer)
    
    let userId = payload.user.id
    let user = null
    
    if (userId) {
      const existingUsers = await db
        .select()
        .from(schema.users)
        .where(and(
          eq(schema.users.id, userId),
          eq(schema.users.projectId, projectId)
        ))
        .limit(1)
      
      if (existingUsers.length > 0) {
        user = existingUsers[0]
        
        await db
          .update(schema.users)
          .set({ 
            lastSeen: new Date(),
            device: userAgentInfo.device,
            browser: userAgentInfo.browser,
            os: userAgentInfo.os
          })
          .where(eq(schema.users.id, userId))
      }
    }
    
    if (!user) {
      userId = userId || generateUserId()
      
      const insertedUsers = await db
        .insert(schema.users)
        .values({
          id: userId,
          projectId,
          device: userAgentInfo.device,
          browser: userAgentInfo.browser,
          os: userAgentInfo.os,
          country: payload.user.country,
          city: payload.user.city,
          lat: payload.user.lat,
          lng: payload.user.lng,
          isDev
        })
        .returning()
      
      user = insertedUsers[0]
    }
    
    let sessionId = payload.session.id
    let session = null
    
    if (sessionId) {
      const existingSessions = await db
        .select()
        .from(schema.sessions)
        .where(and(
          eq(schema.sessions.id, sessionId),
          eq(schema.sessions.userId, userId)
        ))
        .limit(1)
      
      if (existingSessions.length > 0) {
        session = existingSessions[0]
      }
    }
    
    if (!session) {
      sessionId = sessionId || generateSessionId()
      
      const insertedSessions = await db
        .insert(schema.sessions)
        .values({
          id: sessionId,
          userId: userId,
          referrer: payload.session.referrer,
          origin
        })
        .returning()
      
      session = insertedSessions[0]
    }
    
    await db
      .insert(schema.pageviews)
      .values({
        sessionId: sessionId,
        url: payload.pageview.url,
        timestamp: payload.pageview.timestamp ? new Date(payload.pageview.timestamp) : new Date(),
        durationMs: payload.pageview.durationMs
      })
    
    return c.body(null, 204)
    
  } catch (error) {
    console.error('Track route error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})
