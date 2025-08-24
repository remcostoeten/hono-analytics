import { rateLimiter } from 'hono-rate-limiter'
import type { Context } from 'hono'

export function createRateLimiter(windowMs: number, limit: number) {
  return rateLimiter({
    windowMs,
    limit,
    standardHeaders: 'draft-6',
    keyGenerator: (c: Context) => {
      const apiKey = c.req.header('x-api-key')
      const ip = c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || 'unknown'
      
      if (apiKey) {
        return `key:${apiKey}`
      }
      
      return `ip:${ip}`
    },
    handler: (c: Context) => {
      return c.json(
        { 
          error: 'Too many requests', 
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: c.res.headers.get('Retry-After')
        }, 
        429
      )
    }
  })
}

export const trackRateLimiter = createRateLimiter(
  60 * 1000,
  100
)

export const metricsRateLimiter = createRateLimiter(
  60 * 1000,
  60
)

export const strictRateLimiter = createRateLimiter(
  60 * 1000,
  10
)
