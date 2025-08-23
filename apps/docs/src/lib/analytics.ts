export type TAnalyticsEnvironment = 'development' | 'production' | 'combined'

export type TAnalyticsConfig = {
  endpoint: string
  apiKey: string
  projectId: string
  enabled: boolean
}

export function getAnalyticsConfig(environment?: TAnalyticsEnvironment): TAnalyticsConfig {
  const env = environment || (process.env.NEXT_PUBLIC_ANALYTICS_ENVIRONMENT as TAnalyticsEnvironment) || 'development'
  
  const configs = {
    development: {
      endpoint: process.env.NEXT_PUBLIC_ANALYTICS_DEV_ENDPOINT || 'http://localhost:8000',
      apiKey: process.env.NEXT_PUBLIC_ANALYTICS_DEV_API_KEY || 'docs-dev-key',
      projectId: process.env.NEXT_PUBLIC_ANALYTICS_DEV_PROJECT_ID || 'hono-analytics-docs-dev',
      enabled: true
    },
    production: {
      endpoint: process.env.NEXT_PUBLIC_ANALYTICS_PROD_ENDPOINT || 'https://your-analytics-api.vercel.app',
      apiKey: process.env.NEXT_PUBLIC_ANALYTICS_PROD_API_KEY || 'docs-prod-key',
      projectId: process.env.NEXT_PUBLIC_ANALYTICS_PROD_PROJECT_ID || 'hono-analytics-docs-prod',
      enabled: Boolean(process.env.NEXT_PUBLIC_ANALYTICS_PROD_ENDPOINT)
    },
    combined: {
      // For combined view, we'll use production config as primary
      endpoint: process.env.NEXT_PUBLIC_ANALYTICS_PROD_ENDPOINT || 'https://your-analytics-api.vercel.app',
      apiKey: process.env.NEXT_PUBLIC_ANALYTICS_PROD_API_KEY || 'docs-prod-key',
      projectId: process.env.NEXT_PUBLIC_ANALYTICS_PROD_PROJECT_ID || 'hono-analytics-docs-prod',
      enabled: Boolean(process.env.NEXT_PUBLIC_ANALYTICS_PROD_ENDPOINT)
    }
  }

  return configs[env]
}

export function isAnalyticsEnabled(): boolean {
  const config = getAnalyticsConfig()
  return config.enabled && Boolean(config.endpoint) && Boolean(config.apiKey)
}

export function getCurrentEnvironment(): TAnalyticsEnvironment {
  if (typeof window === 'undefined') {
    return 'development'
  }
  
  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development'
  }
  
  return 'production'
}
