import type { TAdapter, TStorageConfig } from './types'
import { LocalAdapter } from './adapters/local'
import { IndexDBAdapter } from './adapters/indexdb'
import { SQLiteAdapter } from './adapters/sqlite'
import { PostgresAdapter } from './adapters/postgres'
import { TursoAdapter } from './adapters/turso'

export function createAdapter(config: TStorageConfig): TAdapter {
  switch (config.type) {
    case 'local':
      return new LocalAdapter()
    case 'indexdb':
      return new IndexDBAdapter()
    case 'sqlite':
      if (!config.url) throw new Error('SQLite requires url')
      return new SQLiteAdapter(config.url)
    case 'postgres':
      if (!config.url) throw new Error('Postgres requires url')
      return new PostgresAdapter(config.url)
    case 'turso':
      if (!config.url || !config.token) throw new Error('Turso requires url and token')
      return new TursoAdapter(config.url, config.token)
    default:
      throw new Error(`Unknown storage type: ${config.type}`)
  }
}
