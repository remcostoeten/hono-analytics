import { z } from 'zod'
import { geoSchema, deviceSchema, optionalIdSchema } from './common.js'

/**
 * Schemas for the track endpoint
 */

// User tracking data
export const userTrackingSchema = z.object({
  id: optionalIdSchema,
  ...deviceSchema.shape,
  ...geoSchema.shape
})

// Session tracking data
export const sessionTrackingSchema = z.object({
  id: optionalIdSchema,
  referrer: z.string().url().optional(),
  origin: z.string().optional()
})

// Pageview tracking data
export const pageviewTrackingSchema = z.object({
  url: z.string().url('Invalid URL format'),
  timestamp: z.string().datetime().optional(),
  durationMs: z.number().min(0).optional(),
  title: z.string().optional(),
  path: z.string().optional()
})

// Main tracking payload schema
export const trackingPayloadSchema = z.object({
  user: userTrackingSchema,
  session: sessionTrackingSchema,
  pageview: pageviewTrackingSchema
})

// Headers schema for track endpoint
export const trackHeadersSchema = z.object({
  'x-api-key': z.string().min(1, 'API key is required'),
  'x-dev-traffic': z.string().optional(),
  'user-agent': z.string().optional(),
  host: z.string().optional()
})

// Event tracking schema (for future events beyond pageviews)
export const eventTrackingSchema = z.object({
  name: z.string().min(1),
  properties: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional()
})

// Extended tracking payload with events
export const extendedTrackingPayloadSchema = trackingPayloadSchema.extend({
  events: z.array(eventTrackingSchema).optional()
})

// Response schemas
export const trackSuccessResponseSchema = z.null()

export const trackErrorResponseSchema = z.object({
  error: z.string(),
  code: z.enum(['INVALID_API_KEY', 'VALIDATION_ERROR', 'INTERNAL_ERROR']).optional()
})
