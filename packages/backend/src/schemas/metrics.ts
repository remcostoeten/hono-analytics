import { z } from 'zod'
import { dateRangeSchema, paginationSchema } from './common.js'

/**
 * Schemas for the metrics endpoint
 */

// Query parameters for metrics endpoint
export const metricsQuerySchema = z.object({
  project: z.string().optional(),
  exclude_dev: z.coerce.boolean().default(true),
  ...dateRangeSchema.shape,
  ...paginationSchema.shape
})

// Headers schema for metrics endpoint
export const metricsHeadersSchema = z.object({
  'x-api-key': z.string().min(1, 'API key is required')
})

// Individual breakdown schemas
export const pageBreakdownSchema = z.object({
  url: z.string(),
  views: z.number(),
  avgDuration: z.number(),
  bounceRate: z.number().optional()
})

export const countryBreakdownSchema = z.object({
  country: z.string(),
  users: z.number(),
  sessions: z.number().optional()
})

export const browserBreakdownSchema = z.object({
  browser: z.string(),
  users: z.number(),
  version: z.string().optional()
})

export const deviceBreakdownSchema = z.object({
  device: z.string(),
  users: z.number(),
  sessions: z.number().optional()
})

// Timeseries data point
export const timeseriesPointSchema = z.object({
  date: z.string(),
  users: z.number(),
  sessions: z.number(),
  pageviews: z.number(),
  avgDuration: z.number().optional()
})

// Totals schema
export const totalsSchema = z.object({
  users: z.number(),
  sessions: z.number(),
  pageviews: z.number(),
  avgDuration: z.number(),
  bounceRate: z.number().optional()
})

// Main metrics response schema
export const metricsResponseSchema = z.object({
  totals: totalsSchema,
  timeseries: z.array(timeseriesPointSchema),
  breakdowns: z.object({
    topPages: z.array(pageBreakdownSchema),
    countries: z.array(countryBreakdownSchema),
    browsers: z.array(browserBreakdownSchema),
    devices: z.array(deviceBreakdownSchema)
  }),
  meta: z.object({
    dateRange: z.object({
      start: z.string(),
      end: z.string()
    }),
    timezone: z.string().optional(),
    filters: z.record(z.string(), z.any()).optional()
  }).optional()
})

// Error response for metrics
export const metricsErrorResponseSchema = z.object({
  error: z.string(),
  code: z.enum(['INVALID_API_KEY', 'INVALID_RANGE', 'INTERNAL_ERROR']).optional()
})
