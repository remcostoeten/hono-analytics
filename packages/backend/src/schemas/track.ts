import { z } from 'zod'
import { geoSchema, deviceSchema, optionalIdSchema } from './common.js'

/**
 * Schemas for the track endpoint
 */

const userTrackingSchema = z.object({
  id: optionalIdSchema,
  ...deviceSchema.shape,
  ...geoSchema.shape
})

const sessionTrackingSchema = z.object({
  id: optionalIdSchema,
  referrer: z.string().url().optional(),
  origin: z.string().optional()
})

const pageviewTrackingSchema = z.object({
  url: z.string().url('Invalid URL format'),
  timestamp: z.string().datetime().optional(),
  durationMs: z.number().min(0).optional(),
  title: z.string().optional(),
  path: z.string().optional()
})

export const trackingPayloadSchema = z.object({
  user: userTrackingSchema,
  session: sessionTrackingSchema,
  pageview: pageviewTrackingSchema
})


