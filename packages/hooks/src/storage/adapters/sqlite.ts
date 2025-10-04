import type { TAdapter, TEvent, TSession, TMetric, TEventFilter } from '../types'

export class SQLiteAdapter implements TAdapter {
  private db: any = null

  constructor(private url: string) {}

  async connect(): Promise<void> {
    throw new Error('SQLite adapter requires better-sqlite3. Install: bun add better-sqlite3')
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  async insertEvent(event: TEvent): Promise<void> {
    throw new Error('Not implemented')
  }

  async insertSession(session: TSession): Promise<void> {
    throw new Error('Not implemented')
  }

  async queryMetrics(start: Date, end: Date): Promise<TMetric[]> {
    throw new Error('Not implemented')
  }

  async queryEvents(filters: TEventFilter): Promise<TEvent[]> {
    throw new Error('Not implemented')
  }
}
