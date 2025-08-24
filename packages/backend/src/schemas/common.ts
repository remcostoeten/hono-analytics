/**
 * Common validation schemas used across multiple endpoints
 */

import { z } from 'zod'

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
})

export const apiKeySchema = z.object({
  'x-api-key': z.string().min(1, 'API key is required')
})

export const dateRangeSchema = z.object({
  range: z.enum(['1h', '24h', '7d', '30d', '90d']).default('7d'),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional()
})

export const geoSchema = z.object({
  country: z.string().optional(),
  city: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional()
})

export const deviceSchema = z.object({
  device: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional()
})

export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.string(), z.any()).optional()
})

export const successResponseSchema = z.object({
  success: z.boolean().default(true),
  message: z.string().optional()
})

export const idSchema = z.string().min(1)
export const optionalIdSchema = z.string().optional()
