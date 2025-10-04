import type { TStorageConfig } from './types'

export function local(): TStorageConfig {
  return { type: 'local' }
}

export function indexdb(): TStorageConfig {
  return { type: 'indexdb' }
}

export function sqlite(url: string): TStorageConfig {
  return { type: 'sqlite', url }
}

export function postgres(url: string): TStorageConfig {
  return { type: 'postgres', url }
}

export function turso(url: string, token: string): TStorageConfig {
  return { type: 'turso', url, token }
}
