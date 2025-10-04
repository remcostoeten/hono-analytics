import { createAdapter } from './factory'
import type { TAdapter, TStorageConfig } from './types'

let adapter: TAdapter | null = null

export async function initStorage(config: TStorageConfig): Promise<TAdapter> {
  adapter = createAdapter(config)
  await adapter.connect()
  return adapter
}

export function getAdapter(): TAdapter {
  if (!adapter) throw new Error('Storage not initialized. Call initStorage first.')
  return adapter
}

export async function closeStorage(): Promise<void> {
  if (adapter) {
    await adapter.disconnect()
    adapter = null
  }
}

export { local, indexdb, sqlite, postgres, turso } from './configs'
export type { TEvent, TSession, TMetric, TAdapter, TEventFilter, TStorageConfig } from './types'
