import { config } from 'dotenv'

config()

type TEnvironment = 'development' | 'production' | 'test'

type TEnvironmentConfig = {
  NODE_ENV: TEnvironment
  PORT: number
  DATABASE_URL: string
  DEFAULT_API_KEY: string
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error'
}

function validateEnvironment(): TEnvironmentConfig {
  const nodeEnv = (process.env.NODE_ENV as TEnvironment) || 'development'
  const port = parseInt(process.env.PORT || '8000', 10)
  const databaseUrl = process.env.DATABASE_URL
  const defaultApiKey = process.env.DEFAULT_API_KEY
  const logLevel = (process.env.LOG_LEVEL as TEnvironmentConfig['LOG_LEVEL']) || 'info'

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  if (!defaultApiKey) {
    throw new Error('DEFAULT_API_KEY environment variable is required')
  }

  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid number between 1 and 65535')
  }

  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be development, production, or test')
  }

  if (!['debug', 'info', 'warn', 'error'].includes(logLevel)) {
    throw new Error('LOG_LEVEL must be debug, info, warn, or error')
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: port,
    DATABASE_URL: databaseUrl,
    DEFAULT_API_KEY: defaultApiKey,
    LOG_LEVEL: logLevel
  }
}

export const env = validateEnvironment()

export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development'
}

export function isProduction(): boolean {
  return env.NODE_ENV === 'production'
}


