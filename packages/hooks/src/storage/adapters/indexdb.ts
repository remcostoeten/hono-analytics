import type { TAdapter, TEvent, TSession, TMetric, TEventFilter } from '../types'

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

  private getAllEvents(): Promise<TEvent[]> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(EVENTS_STORE, 'readonly')
      const store = tx.objectStore(EVENTS_STORE)
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
}
