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

// Project creation schema
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  domain: z.string().url().optional(),
  description: z.string().optional(),
  settings: z.object({
    trackPageviews: z.boolean().default(true),
    trackEvents: z.boolean().default(true),
    trackClicks: z.boolean().default(false),
    allowDevTraffic: z.boolean().default(false)
  }).optional()
})

// Login/authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional()
})

// Token schemas
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
})

export const revokeTokenSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required')
})

// Response schemas
export const authSuccessResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    company: z.string().optional()
  })
})

export const apiKeyResponseSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  permissions: z.array(z.string()),
  createdAt: z.string(),
  expiresAt: z.string().optional()
})

export const projectResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  apiKey: z.string(),
  domain: z.string().optional(),
  createdAt: z.string(),
  settings: z.record(z.any()).optional()
})
