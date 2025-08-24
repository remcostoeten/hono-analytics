import { z } from 'zod'

/**
 * Common validation schemas used across multiple endpoints
 */

// Base pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
})

// API key validation
export const apiKeySchema = z.object({
  'x-api-key': z.string().min(1, 'API key is required')
})

// Date range validation
export const dateRangeSchema = z.object({
  range: z.enum(['1h', '24h', '7d', '30d', '90d']).default('7d'),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional()
})

// Geographic data
export const geoSchema = z.object({
  country: z.string().optional(),
  city: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional()
})

// Device info
export const deviceSchema = z.object({
  device: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional()
})

// Common response schemas
export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.any()).optional()
})

export const successResponseSchema = z.object({
  success: z.boolean().default(true),
  message: z.string().optional()
})

// ID validation
export const idSchema = z.string().min(1)
export const optionalIdSchema = z.string().optional()
