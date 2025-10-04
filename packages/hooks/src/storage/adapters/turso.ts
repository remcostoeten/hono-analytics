import type { TAdapter, TEvent, TSession, TMetric, TEventFilter } from '../types'

export class TursoAdapter implements TAdapter {
  private client: any = null

  constructor(private url: string, private token: string) {}

  async connect(): Promise<void> {
    throw new Error('Turso adapter requires @libsql/client. Install: bun add @libsql/client')
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.close()
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
