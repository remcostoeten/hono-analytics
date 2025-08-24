import { z } from 'zod'
import { dateRangeSchema, paginationSchema } from './common.js'

/**
 * Schemas for the metrics endpoint
 */

// Query parameters for metrics endpoint (ACTUALLY USED)
export const metricsQuerySchema = z.object({
  project: z.string().optional(),
  exclude_dev: z.coerce.boolean().default(true),
  ...dateRangeSchema.shape,
  ...paginationSchema.shape
})