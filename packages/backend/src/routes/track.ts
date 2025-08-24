import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { eq, and } from 'drizzle-orm'
import { schema } from '../config/index.js'
import { 
  parseUserAgent, 
  isDevTraffic, 
  generateUserId, 
  generateSessionId, 
  parseOrigin 
} from '../utils/helpers.js'
import { trackingPayloadSchema } from '../schemas/index.js'
import type { TDatabase } from '../config/index.js'

type TBindings = {
  db: TDatabase
}

export const trackRoute = new Hono<{ Bindings: TBindings }>()

trackRoute.post('/', zValidator('json', trackingPayloadSchema), async (c) => {
  const payload = c.req.valid('json')
  const apiKey = c.req.header('x-api-key')
  const devHeader = c.req.header('x-dev-traffic')
  const host = c.req.header('host')
  const userAgent = c.req.header('user-agent') || ''
  
  if (!apiKey) {
    return c.json({ error: 'API key required' }, 401)
  }
  
  const database = c.env.db
  
  try {
    const project = await database
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
      const existingUsers = await database
        .select()
        .from(schema.users)
        .where(and(
          eq(schema.users.id, userId),
          eq(schema.users.projectId, projectId)
        ))
        .limit(1)
      
      if (existingUsers.length > 0) {
        user = existingUsers[0]
        
        await database
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
      
      const insertedUsers = await database
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
    
    if (sessionId && userId) {
      const existingSessions = await database
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
    
    if (!session && userId) {
      sessionId = sessionId || generateSessionId()
      
      const insertedSessions = await database
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
    
    if (sessionId) {
      await database
        .insert(schema.pageviews)
        .values({
          sessionId: sessionId,
          url: payload.pageview.url,
          timestamp: payload.pageview.timestamp ? new Date(payload.pageview.timestamp) : new Date(),
          durationMs: payload.pageview.durationMs
        })
    }
    
    return c.body(null, 204)
    
  } catch (error) {
    console.error('Track route error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})
