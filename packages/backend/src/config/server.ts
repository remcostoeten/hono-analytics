import { env, isDevelopment } from './env.js'

type TCorsConfig = {
  origin: string[]
  allowMethods: string[]
  allowHeaders: string[]
  credentials: boolean
}

type TServerConfig = {
  port: number
  hostname: string
  cors: TCorsConfig
  logLevel: string
}

function getCorsOrigins(): string[] {
  const corsOrigin = process.env.CORS_ORIGIN
  
  if (corsOrigin) {
    return corsOrigin.split(',').map(origin => origin.trim())
  }
  
  if (isDevelopment()) {
    return [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:5173'
    ]
  }
  
  return [
    'https://hono-analytics-docs.vercel.app'
  ]
}

function getServerConfig(): TServerConfig {
  return {
    port: env.PORT,
    hostname: '0.0.0.0',
    cors: {
      origin: getCorsOrigins(),
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-dev-traffic'],
      credentials: true
    },
    logLevel: env.LOG_LEVEL
  }
}

export const serverConfig = getServerConfig()

export function getApiInfo() {
  return {
    name: 'HONO Analytics API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      track: 'POST /track',
      metrics: 'GET /metrics'
    },
    environment: env.NODE_ENV,
    database: env.DATABASE_URL.split('://')[0]
  }
}

export function getDatabaseInfo() {
  const url = env.DATABASE_URL
  const protocol = url.split('://')[0]
  
  if (url.startsWith('sqlite:')) {
    const dbPath = url.replace('sqlite:', '')
    return {
      dialect: 'SQLite',
      driver: 'better-sqlite3',
      path: dbPath,
      displayName: `SQLite (${dbPath})`,
      emoji: '📁',
      recommended: env.NODE_ENV !== 'production'
    }
  }
  
  // Parse PostgreSQL connection details
  try {
    const urlObj = new URL(url)
    const host = urlObj.hostname
    const port = urlObj.port || '5432'
    const database = urlObj.pathname.slice(1) // Remove leading slash
    
    return {
      dialect: 'PostgreSQL',
      driver: 'node-postgres',
      host,
      port,
      database,
      displayName: `PostgreSQL (${host}:${port}/${database})`,
      emoji: '🐘',
      recommended: true
    }
  } catch {
    return {
      dialect: protocol.toUpperCase(),
      driver: 'unknown',
      displayName: `${protocol.toUpperCase()} Database`,
      emoji: '🗄️',
      recommended: false
    }
  }
}
