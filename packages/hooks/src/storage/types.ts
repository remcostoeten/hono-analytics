export type TEvent = {
  id: string
  timestamp: number
  userId?: string
  sessionId: string
  url: string
  event: string
  meta?: Record<string, unknown>
}

export type TSession = {
  id: string
  userId?: string
  startTime: number
  endTime?: number
  pageviews: number
}

export type TMetric = {
  date: string
  users: number
  sessions: number
  pageviews: number
}

export type TAdapter = {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  insertEvent: (event: TEvent) => Promise<void>
  insertSession: (session: TSession) => Promise<void>
  queryMetrics: (start: Date, end: Date) => Promise<TMetric[]>
  queryEvents: (filters: TEventFilter) => Promise<TEvent[]>
}

export type TEventFilter = {
  start?: Date
  end?: Date
  userId?: string
  sessionId?: string
  event?: string
}

export type TStorageConfig = {
  type: 'local' | 'indexdb' | 'sqlite' | 'postgres' | 'turso'
  url?: string
  token?: string
}
