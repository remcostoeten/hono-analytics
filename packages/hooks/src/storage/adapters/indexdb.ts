import type { 
  TAdapter, 
  TEvent, 
  TSession, 
  TMetric, 
  TEventFilter,
  TPageStat,
  TCountryStat,
  TBrowserStat,
  TDeviceStat,
  TTotals,
  TFullMetrics
} from '../types'
import { parseUserAgent } from '../parsers/user-agent'
import { parseIpToCountrySync } from '../parsers/geo'
import { calculateAvgSessionDuration } from '../utils/duration'

const DB_NAME = 'honolytics'
const DB_VERSION = 1
const EVENTS_STORE = 'events'
const SESSIONS_STORE = 'sessions'

export class IndexDBAdapter implements TAdapter {
  private db: IDBDatabase | null = null

  async connect(): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      throw new Error('IndexedDB not available')
    }

    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION)

      req.onerror = () => reject(req.error)
      req.onsuccess = () => {
        this.db = req.result
        resolve()
      }

      req.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(EVENTS_STORE)) {
          const evStore = db.createObjectStore(EVENTS_STORE, { keyPath: 'id' })
          evStore.createIndex('timestamp', 'timestamp')
          evStore.createIndex('sessionId', 'sessionId')
        }

        if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
          db.createObjectStore(SESSIONS_STORE, { keyPath: 'id' })
        }
      }
    })
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  async insertEvent(event: TEvent): Promise<void> {
    if (!this.db) throw new Error('DB not connected')
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(EVENTS_STORE, 'readwrite')
      const store = tx.objectStore(EVENTS_STORE)
      const req = store.put(event)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  async insertSession(session: TSession): Promise<void> {
    if (!this.db) throw new Error('DB not connected')
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(SESSIONS_STORE, 'readwrite')
      const store = tx.objectStore(SESSIONS_STORE)
      const req = store.put(session)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  async queryMetrics(start: Date, end: Date): Promise<TMetric[]> {
    if (!this.db) throw new Error('DB not connected')
    const events = await this.getAllEvents()
    
    const filtered = events.filter(e => 
      e.timestamp >= start.getTime() && e.timestamp <= end.getTime()
    )

    const byDate = new Map<string, { users: Set<string>, sessions: Set<string>, pageviews: number }>()

    filtered.forEach(e => {
      const date = new Date(e.timestamp).toISOString().split('T')[0]
      if (!byDate.has(date)) {
        byDate.set(date, { users: new Set(), sessions: new Set(), pageviews: 0 })
      }
      const day = byDate.get(date)!
      if (e.userId) day.users.add(e.userId)
      day.sessions.add(e.sessionId)
      if (e.event === 'pageview') day.pageviews++
    })

    return Array.from(byDate.entries()).map(([date, data]) => ({
      date,
      users: data.users.size,
      sessions: data.sessions.size,
      pageviews: data.pageviews
    }))
  }

  async queryEvents(filters: TEventFilter): Promise<TEvent[]> {
    if (!this.db) throw new Error('DB not connected')
    let events = await this.getAllEvents()

    if (filters.start) {
      events = events.filter(e => e.timestamp >= filters.start!.getTime())
    }
    if (filters.end) {
      events = events.filter(e => e.timestamp <= filters.end!.getTime())
    }
    if (filters.userId) {
      events = events.filter(e => e.userId === filters.userId)
    }
    if (filters.sessionId) {
      events = events.filter(e => e.sessionId === filters.sessionId)
    }
    if (filters.event) {
      events = events.filter(e => e.event === filters.event)
    }

    return events
  }

  async queryTopPages(start: Date, end: Date, limit = 10): Promise<TPageStat[]> {
    const events = (await this.getAllEvents()).filter(e => 
      e.timestamp >= start.getTime() && 
      e.timestamp <= end.getTime() &&
      e.event === 'pageview'
    )

    const pageStats = new Map<string, { views: number, totalDuration: number, count: number }>()
    
    events.forEach(e => {
      const existing = pageStats.get(e.url)
      const duration = e.duration || 0
      
      if (existing) {
        existing.views++
        if (duration > 0) {
          existing.totalDuration += duration
          existing.count++
        }
      } else {
        pageStats.set(e.url, {
          views: 1,
          totalDuration: duration,
          count: duration > 0 ? 1 : 0
        })
      }
    })

    const result: TPageStat[] = Array.from(pageStats.entries()).map(([url, data]) => ({
      url,
      views: data.views,
      avgDuration: data.count > 0 ? data.totalDuration / data.count : 0
    }))

    return result
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
  }

  async queryCountries(start: Date, end: Date, limit = 10): Promise<TCountryStat[]> {
    const events = (await this.getAllEvents()).filter(e => 
      e.timestamp >= start.getTime() && e.timestamp <= end.getTime()
    )

    const countryUsers = new Map<string, Set<string>>()
    
    events.forEach(e => {
      const country = e.ip ? parseIpToCountrySync(e.ip) : 'Unknown'
      
      if (!countryUsers.has(country)) {
        countryUsers.set(country, new Set())
      }
      
      if (e.userId) {
        countryUsers.get(country)!.add(e.userId)
      }
    })

    const result: TCountryStat[] = Array.from(countryUsers.entries()).map(([country, users]) => ({
      country,
      users: users.size
    }))

    return result
      .sort((a, b) => b.users - a.users)
      .slice(0, limit)
  }

  async queryBrowsers(start: Date, end: Date, limit = 10): Promise<TBrowserStat[]> {
    const events = (await this.getAllEvents()).filter(e => 
      e.timestamp >= start.getTime() && e.timestamp <= end.getTime()
    )

    const browserUsers = new Map<string, Set<string>>()
    
    events.forEach(e => {
      if (!e.userAgent) return
      
      const parsed = parseUserAgent(e.userAgent)
      const browser = parsed.browser
      
      if (!browserUsers.has(browser)) {
        browserUsers.set(browser, new Set())
      }
      
      if (e.userId) {
        browserUsers.get(browser)!.add(e.userId)
      }
    })

    const result: TBrowserStat[] = Array.from(browserUsers.entries()).map(([browser, users]) => ({
      browser,
      users: users.size
    }))

    return result
      .sort((a, b) => b.users - a.users)
      .slice(0, limit)
  }

  async queryDevices(start: Date, end: Date, limit = 10): Promise<TDeviceStat[]> {
    const events = (await this.getAllEvents()).filter(e => 
      e.timestamp >= start.getTime() && e.timestamp <= end.getTime()
    )

    const deviceUsers = new Map<string, Set<string>>()
    
    events.forEach(e => {
      if (!e.userAgent) return
      
      const parsed = parseUserAgent(e.userAgent)
      const device = parsed.device
      
      if (!deviceUsers.has(device)) {
        deviceUsers.set(device, new Set())
      }
      
      if (e.userId) {
        deviceUsers.get(device)!.add(e.userId)
      }
    })

    const result: TDeviceStat[] = Array.from(deviceUsers.entries()).map(([device, users]) => ({
      device,
      users: users.size
    }))

    return result
      .sort((a, b) => b.users - a.users)
      .slice(0, limit)
  }

  async queryTotals(start: Date, end: Date): Promise<TTotals> {
    const events = (await this.getAllEvents()).filter(e => 
      e.timestamp >= start.getTime() && e.timestamp <= end.getTime()
    )
    
    const sessions = (await this.getAllSessions()).filter(s => 
      s.startTime >= start.getTime() && s.startTime <= end.getTime()
    )

    const uniqueUsers = new Set<string>()
    const uniqueSessions = new Set<string>()
    let totalPageviews = 0

    events.forEach(e => {
      if (e.userId) uniqueUsers.add(e.userId)
      uniqueSessions.add(e.sessionId)
      if (e.event === 'pageview') totalPageviews++
    })

    const avgDuration = calculateAvgSessionDuration(sessions)

    return {
      users: uniqueUsers.size,
      sessions: uniqueSessions.size,
      pageviews: totalPageviews,
      avgDuration
    }
  }

  async queryFullMetrics(start: Date, end: Date): Promise<TFullMetrics> {
    const [totals, timeseries, topPages, countries, browsers, devices] = await Promise.all([
      this.queryTotals(start, end),
      this.queryMetrics(start, end),
      this.queryTopPages(start, end),
      this.queryCountries(start, end),
      this.queryBrowsers(start, end),
      this.queryDevices(start, end)
    ])

    return {
      totals,
      timeseries,
      breakdowns: {
        topPages,
        countries,
        browsers,
        devices
      }
    }
  }

  private getAllEvents(): Promise<TEvent[]> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(EVENTS_STORE, 'readonly')
      const store = tx.objectStore(EVENTS_STORE)
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  private getAllSessions(): Promise<TSession[]> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(SESSIONS_STORE, 'readonly')
      const store = tx.objectStore(SESSIONS_STORE)
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
}
