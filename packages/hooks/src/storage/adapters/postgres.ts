import type { TAdapter, TEvent, TSession, TMetric, TEventFilter } from '../types'

export class PostgresAdapter implements TAdapter {
  private client: any = null

  constructor(private url: string) {}

  async connect(): Promise<void> {
    throw new Error('Postgres adapter requires postgres.js or pg. Install: bun add postgres')
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end()
      this.client = null
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
