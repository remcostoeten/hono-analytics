/**
 * Common validation schemas used across multiple endpoints
 */

import { z } from 'zod'

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
})

export const dateRangeSchema = z.object({
  range: z.enum(['1h', '24h', '7d', '30d', '90d']).default('7d'),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional()
})

// Used in tracking payload
export const geoSchema = z.object({
  country: z.string().optional(),
  city: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional()
})

// Used in tracking payload
export const deviceSchema = z.object({
  device: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional()
})

// Utility schemas for tracking
export const optionalIdSchema = z.string().optional()