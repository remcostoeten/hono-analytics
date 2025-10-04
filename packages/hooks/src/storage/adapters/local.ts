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
import { calculatePageDurations, calculateAvgSessionDuration } from '../utils/duration'

const EVENTS_KEY = 'honolytics:events'
const SESSIONS_KEY = 'honolytics:sessions'

export class LocalAdapter implements TAdapter {
  async connect(): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('LocalStorage requires browser environment')
    }
  }

  async disconnect(): Promise<void> {}

  async insertEvent(event: TEvent): Promise<void> {
    const events = this.getEvents()
    events.push(event)
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
  }

  async insertSession(session: TSession): Promise<void> {
    const sessions = this.getSessions()
    const idx = sessions.findIndex(s => s.id === session.id)
    if (idx >= 0) {
      sessions[idx] = session
    } else {
      sessions.push(session)
    }
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  }

  async queryMetrics(start: Date, end: Date): Promise<TMetric[]> {
    const events = this.getEvents().filter(e => 
      e.timestamp >= start.getTime() && e.timestamp <= end.getTime()
    )
    
    const byDate = new Map<string, { users: Set<string>, sessions: Set<string>, pageviews: number }>()
    
    events.forEach(e => {
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
    let events = this.getEvents()
    
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
    const events = this.getEvents().filter(e => 
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
    const events = this.getEvents().filter(e => 
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
    const events = this.getEvents().filter(e => 
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
    const events = this.getEvents().filter(e => 
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
    const events = this.getEvents().filter(e => 
      e.timestamp >= start.getTime() && e.timestamp <= end.getTime()
    )
    
    const sessions = this.getSessions().filter(s => 
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

  private getEvents(): TEvent[] {
    const raw = localStorage.getItem(EVENTS_KEY)
    return raw ? JSON.parse(raw) : []
  }

  private getSessions(): TSession[] {
    const raw = localStorage.getItem(SESSIONS_KEY)
    return raw ? JSON.parse(raw) : []
  }
}
