/**
 * Central export point for all validation schemas
 * This allows clean imports like: import { trackingPayloadSchema } from '../schemas'
 */

// Common schemas
export * from './common.js'

// Track endpoint schemas
export * from './track.js'

// Metrics endpoint schemas  
export * from './metrics.js'

// Authentication schemas
export * from './auth.js'

// Re-export zod for convenience
export { z } from 'zod'

// Schema inference types for easy TypeScript integration
import type { z } from 'zod'
import type { 
  trackingPayloadSchema
} from './track.js'
import type { 
  metricsQuerySchema, 
  metricsResponseSchema
} from './metrics.js'
import type {
  createProjectSchema,
  createApiKeySchema
} from './auth.js'

// Inferred types from schemas (auto-generated from Zod)
export type TrackingPayload = z.infer<typeof trackingPayloadSchema>
export type MetricsQuery = z.infer<typeof metricsQuerySchema>
export type MetricsResponse = z.infer<typeof metricsResponseSchema>
export type CreateApiKey = z.infer<typeof createApiKeySchema>

// Validation result types
export type ValidationSuccess<T> = {
  success: true
  data: T
}

export type ValidationError = {
  success: false
  error: {
    message: string
    issues: Array<{
      path: string[]
      message: string
      code: string
    }>
  }
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationError

// Utility function for safe schema validation
export function safeValidate<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return {
      success: true,
      data: result.data
    }
  }
  
  return {
    success: false,
    error: {
      message: 'Validation failed',
      issues: result.error.issues.map(issue => ({
        path: issue.path.map(String),
        message: issue.message,
        code: issue.code
      }))
    }
  }
}
