import { z } from 'zod'

/**
 * Schemas for authentication and authorization
 */

// API key creation schema
export const createApiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required'),
  description: z.string().optional(),
  permissions: z.array(z.enum(['read', 'write', 'admin'])).default(['read', 'write']),
  expiresAt: z.string().datetime().optional()
})
