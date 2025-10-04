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
import { runMigrations, getSchemaVersionSQL, type TMigrationRunner } from '../utils/migrate'

export type TTursoConfig = {
  url: string
  token: string
}

export class TursoAdapter implements TAdapter {
  private client: any = null
  private config: TTursoConfig

  constructor(config: TTursoConfig) {
    this.config = config
  }

  async connect(): Promise<void> {
    try {
      // Dynamic import to handle optional dependency
      const { createClient } = await import('@libsql/client')
      
      this.client = createClient({
        url: this.config.url,
        authToken: this.config.token
      })
      
      // Test connection
      await this.client.execute('SELECT 1')
      
      // Run migrations
      await this.runMigrations()
      
    } catch (error: any) {
      if (error.code === 'MODULE_NOT_FOUND' || error.message.includes('@libsql/client')) {
        throw new Error('Turso adapter requires @libsql/client. Install: bun add @libsql/client')
      }
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.close()
      this.client = null
    }
  }

  async insertEvent(event: TEvent): Promise<void> {
    await this.client.execute({
      sql: `
        INSERT OR REPLACE INTO events (
          id, timestamp, user_id, session_id, url, event, 
          user_agent, ip, referrer, duration, meta
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        event.id,
        event.timestamp,
        event.userId || null,
        event.sessionId,
        event.url,
        event.event,
        event.userAgent || null,
        event.ip || null,
        event.referrer || null,
        event.duration || null,
        event.meta ? JSON.stringify(event.meta) : null
      ]
    })
  }

  async insertSession(session: TSession): Promise<void> {
    await this.client.execute({
      sql: `
        INSERT OR REPLACE INTO sessions (
          id, user_id, start_time, end_time, pageviews, duration
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [
        session.id,
        session.userId || null,
        session.startTime,
        session.endTime || null,
        session.pageviews,
        session.duration || null
      ]
    })
  }

  async queryMetrics(start: Date, end: Date): Promise<TMetric[]> {
    const startMs = start.getTime()
    const endMs = end.getTime()
    
    const result = await this.client.execute({
      sql: `
        SELECT 
          DATE(datetime(timestamp / 1000, 'unixepoch')) as date,
          COUNT(DISTINCT user_id) as users,
          COUNT(DISTINCT session_id) as sessions,
          COUNT(CASE WHEN event = 'pageview' THEN 1 END) as pageviews
        FROM events 
        WHERE timestamp >= ? AND timestamp <= ?
        GROUP BY DATE(datetime(timestamp / 1000, 'unixepoch'))
        ORDER BY date
      `,
      args: [startMs, endMs]
    })
    
    return result.rows.map((row: any) => ({
      date: row.date,
      users: parseInt(row.users),
      sessions: parseInt(row.sessions),
      pageviews: parseInt(row.pageviews)
    }))
  }

  async queryEvents(filters: TEventFilter): Promise<TEvent[]> {
    const conditions = []
    const args: any[] = []
    
    if (filters.start) {
      conditions.push('timestamp >= ?')
      args.push(filters.start.getTime())
    }
    if (filters.end) {
      conditions.push('timestamp <= ?')
      args.push(filters.end.getTime())
    }
    if (filters.userId) {
      conditions.push('user_id = ?')
      args.push(filters.userId)
    }
    if (filters.sessionId) {
      conditions.push('session_id = ?')
      args.push(filters.sessionId)
    }
    if (filters.event) {
      conditions.push('event = ?')
      args.push(filters.event)
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
    
    const result = await this.client.execute({
      sql: `SELECT * FROM events ${whereClause} ORDER BY timestamp DESC`,
      args
    })
    
    return result.rows.map((row: any) => ({
      id: row.id,
      timestamp: row.timestamp,
      userId: row.user_id,
      sessionId: row.session_id,
      url: row.url,
      event: row.event,
      userAgent: row.user_agent,
      ip: row.ip,
      referrer: row.referrer,
      duration: row.duration,
      meta: row.meta ? JSON.parse(row.meta) : undefined
    }))
  }

  async queryTopPages(start: Date, end: Date, limit = 10): Promise<TPageStat[]> {
    const startMs = start.getTime()
    const endMs = end.getTime()
    
    const result = await this.client.execute({
      sql: `
        SELECT 
          url,
          COUNT(*) as views,
          AVG(duration) as avg_duration
        FROM events 
        WHERE timestamp >= ? 
          AND timestamp <= ? 
          AND event = 'pageview'
        GROUP BY url
        ORDER BY views DESC
        LIMIT ?
      `,
      args: [startMs, endMs, limit]
    })
    
    return result.rows.map((row: any) => ({
      url: row.url,
      views: parseInt(row.views),
      avgDuration: parseFloat(row.avg_duration) || 0
    }))
  }

  async queryCountries(start: Date, end: Date, limit = 10): Promise<TCountryStat[]> {
    const startMs = start.getTime()
    const endMs = end.getTime()
    
    const result = await this.client.execute({
      sql: `
        SELECT 
          ip,
          COUNT(DISTINCT user_id) as users
        FROM events 
        WHERE timestamp >= ? 
          AND timestamp <= ?
          AND ip IS NOT NULL
        GROUP BY ip
      `,
      args: [startMs, endMs]
    })
    
    // Parse IPs to countries and aggregate
    const countryStats = new Map<string, number>()
    
    result.rows.forEach((row: any) => {
      const country = parseIpToCountrySync(row.ip)
      countryStats.set(country, (countryStats.get(country) || 0) + parseInt(row.users))
    })
    
    return Array.from(countryStats.entries())
      .map(([country, users]) => ({ country, users }))
      .sort((a, b) => b.users - a.users)
      .slice(0, limit)
  }

  async queryBrowsers(start: Date, end: Date, limit = 10): Promise<TBrowserStat[]> {
    const startMs = start.getTime()
    const endMs = end.getTime()
    
    const result = await this.client.execute({
      sql: `
        SELECT 
          user_agent,
          COUNT(DISTINCT user_id) as users
        FROM events 
        WHERE timestamp >= ? 
          AND timestamp <= ?
          AND user_agent IS NOT NULL
        GROUP BY user_agent
      `,
      args: [startMs, endMs]
    })
    
    // Parse user agents and aggregate by browser
    const browserStats = new Map<string, number>()
    
    result.rows.forEach((row: any) => {
      const parsed = parseUserAgent(row.user_agent)
      const browser = parsed.browser
      browserStats.set(browser, (browserStats.get(browser) || 0) + parseInt(row.users))
    })
    
    return Array.from(browserStats.entries())
      .map(([browser, users]) => ({ browser, users }))
      .sort((a, b) => b.users - a.users)
      .slice(0, limit)
  }

  async queryDevices(start: Date, end: Date, limit = 10): Promise<TDeviceStat[]> {
    const startMs = start.getTime()
    const endMs = end.getTime()
    
    const result = await this.client.execute({
      sql: `
        SELECT 
          user_agent,
          COUNT(DISTINCT user_id) as users
        FROM events 
        WHERE timestamp >= ? 
          AND timestamp <= ?
          AND user_agent IS NOT NULL
        GROUP BY user_agent
      `,
      args: [startMs, endMs]
    })
    
    // Parse user agents and aggregate by device
    const deviceStats = new Map<string, number>()
    
    result.rows.forEach((row: any) => {
      const parsed = parseUserAgent(row.user_agent)
      const device = parsed.device
      deviceStats.set(device, (deviceStats.get(device) || 0) + parseInt(row.users))
    })
    
    return Array.from(deviceStats.entries())
      .map(([device, users]) => ({ device, users }))
      .sort((a, b) => b.users - a.users)
      .slice(0, limit)
  }

  async queryTotals(start: Date, end: Date): Promise<TTotals> {
    const startMs = start.getTime()
    const endMs = end.getTime()
    
    const [eventResult, sessionResult] = await Promise.all([
      this.client.execute({
        sql: `
          SELECT 
            COUNT(DISTINCT user_id) as users,
            COUNT(DISTINCT session_id) as sessions,
            COUNT(CASE WHEN event = 'pageview' THEN 1 END) as pageviews
          FROM events 
          WHERE timestamp >= ? AND timestamp <= ?
        `,
        args: [startMs, endMs]
      }),
      this.client.execute({
        sql: `
          SELECT AVG(duration) as avg_duration
          FROM sessions 
          WHERE start_time >= ? 
            AND start_time <= ?
            AND duration IS NOT NULL
        `,
        args: [startMs, endMs]
      })
    ])
    
    const eventRow = eventResult.rows[0]
    const sessionRow = sessionResult.rows[0]
    
    return {
      users: parseInt(eventRow.users),
      sessions: parseInt(eventRow.sessions),
      pageviews: parseInt(eventRow.pageviews),
      avgDuration: parseFloat(sessionRow.avg_duration) || 0
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

  private async runMigrations(): Promise<void> {
    const migrationRunner: TMigrationRunner = {
      getCurrentVersion: async () => {
        // Create schema_version table if it doesn't exist
        await this.client.execute(getSchemaVersionSQL())
        
        const result = await this.client.execute(
          'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
        )
        
        return result.rows.length > 0 ? result.rows[0].version : 0
      },
      
      runMigration: async (migration) => {
        await this.client.execute(migration.sql)
      },
      
      setVersion: async (version) => {
        await this.client.execute({
          sql: 'INSERT OR IGNORE INTO schema_version (version, applied_at) VALUES (?, ?)',
          args: [version, Date.now()]
        })
      }
    }
    
    await runMigrations(migrationRunner)
  }
}
