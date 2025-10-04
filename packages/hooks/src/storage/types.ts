export type TEvent = {
  id: string
  timestamp: number
  userId?: string
  sessionId: string
  url: string
  event: string
  userAgent?: string
  ip?: string
  referrer?: string
  duration?: number
  meta?: Record<string, unknown>
}

export type TSession = {
  id: string
  userId?: string
  startTime: number
  endTime?: number
  pageviews: number
  duration?: number
}

export type TMetric = {
  date: string
  users: number
  sessions: number
  pageviews: number
}

export type TPageStat = {
  url: string
  views: number
  avgDuration: number
}

export type TCountryStat = {
  country: string
  users: number
}

export type TBrowserStat = {
  browser: string
  users: number
}

export type TDeviceStat = {
  device: string
  users: number
}

export type TTotals = {
  users: number
  sessions: number
  pageviews: number
  avgDuration: number
}

export type TFullMetrics = {
  totals: TTotals
  timeseries: TMetric[]
  breakdowns: {
    topPages: TPageStat[]
    countries: TCountryStat[]
    browsers: TBrowserStat[]
    devices: TDeviceStat[]
  }
}

export type TAdapter = {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  insertEvent: (event: TEvent) => Promise<void>
  insertSession: (session: TSession) => Promise<void>
  queryMetrics: (start: Date, end: Date) => Promise<TMetric[]>
  queryEvents: (filters: TEventFilter) => Promise<TEvent[]>
  queryTopPages: (start: Date, end: Date, limit?: number) => Promise<TPageStat[]>
  queryCountries: (start: Date, end: Date, limit?: number) => Promise<TCountryStat[]>
  queryBrowsers: (start: Date, end: Date, limit?: number) => Promise<TBrowserStat[]>
  queryDevices: (start: Date, end: Date, limit?: number) => Promise<TDeviceStat[]>
  queryTotals: (start: Date, end: Date) => Promise<TTotals>
  queryFullMetrics: (start: Date, end: Date) => Promise<TFullMetrics>
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
