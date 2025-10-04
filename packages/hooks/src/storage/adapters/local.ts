import type { TAdapter, TEvent, TSession, TMetric, TEventFilter } from '../types'

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

  private getEvents(): TEvent[] {
    const raw = localStorage.getItem(EVENTS_KEY)
    return raw ? JSON.parse(raw) : []
  }

  private getSessions(): TSession[] {
    const raw = localStorage.getItem(SESSIONS_KEY)
    return raw ? JSON.parse(raw) : []
  }
}
