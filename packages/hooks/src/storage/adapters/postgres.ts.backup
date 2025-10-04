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
import { runMigrations, getSchemaVersionSQL, type TMigrationRunner } from '../utils/migrate'

export type TPostgresConfig = {
  url: string
  ssl?: boolean
  max?: number // Connection pool size
}

export class PostgresAdapter implements TAdapter {
  private client: any = null
  private config: TPostgresConfig

  constructor(config: string | TPostgresConfig) {
    this.config = typeof config === 'string' ? { url: config } : config
  }

  async connect(): Promise<void> {
    try {
      // Dynamic import to handle optional dependency
      const { default: postgres } = await import('postgres')
      
      this.client = postgres(this.config.url, {
        ssl: this.config.ssl,
        max: this.config.max || 10,
        idle_timeout: 20,
        connect_timeout: 10
      })
      
      // Test connection
      await this.client`SELECT 1`
      
      // Run migrations
      await this.runMigrations()
      
    } catch (error: any) {
      if (error.code === 'MODULE_NOT_FOUND' || error.message.includes('postgres')) {
        throw new Error('Postgres adapter requires postgres.js. Install: bun add postgres')
      }
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end()
      this.client = null
    }
  }

  async insertEvent(event: TEvent): Promise<void> {
    await this.client`
      INSERT INTO events (
        id, timestamp, user_id, session_id, url, event, 
        user_agent, ip, referrer, duration, meta
      ) VALUES (
        ${event.id}, ${event.timestamp}, ${event.userId}, ${event.sessionId}, 
        ${event.url}, ${event.event}, ${event.userAgent}, ${event.ip}, 
        ${event.referrer}, ${event.duration}, ${JSON.stringify(event.meta)}
      )
      ON CONFLICT (id) DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        duration = EXCLUDED.duration
    `
  }

  async insertSession(session: TSession): Promise<void> {
    await this.client`
      INSERT INTO sessions (
        id, user_id, start_time, end_time, pageviews, duration
      ) VALUES (
        ${session.id}, ${session.userId}, ${session.startTime}, 
        ${session.endTime}, ${session.pageviews}, ${session.duration}
      )
      ON CONFLICT (id) DO UPDATE SET
        end_time = EXCLUDED.end_time,
        pageviews = EXCLUDED.pageviews,
        duration = EXCLUDED.duration
    `
  }

  async queryMetrics(start: Date, end: Date): Promise<TMetric[]> {
    const startMs = start.getTime()
    const endMs = end.getTime()
    
    const rows = await this.client`
      SELECT 
        DATE(to_timestamp(timestamp / 1000)) as date,
        COUNT(DISTINCT user_id) as users,
        COUNT(DISTINCT session_id) as sessions,
        COUNT(CASE WHEN event = 'pageview' THEN 1 END) as pageviews
      FROM events 
      WHERE timestamp >= ${startMs} AND timestamp <= ${endMs}
      GROUP BY DATE(to_timestamp(timestamp / 1000))
      ORDER BY date
    `
    
    return rows.map((row: any) => ({
      date: row.date,
      users: parseInt(row.users),
      sessions: parseInt(row.sessions),
      pageviews: parseInt(row.pageviews)
    }))
  }

  async queryEvents(filters: TEventFilter): Promise<TEvent[]> {
    const conditions = []
    const params: any[] = []
    
    if (filters.start) {
      conditions.push('timestamp >= $' + (params.length + 1))
      params.push(filters.start.getTime())
    }
    if (filters.end) {
      conditions.push('timestamp <= $' + (params.length + 1))
      params.push(filters.end.getTime())
    }
    if (filters.userId) {
      conditions.push('user_id = $' + (params.length + 1))
      params.push(filters.userId)
    }
    if (filters.sessionId) {
      conditions.push('session_id = $' + (params.length + 1))
      params.push(filters.sessionId)
    }
    if (filters.event) {
      conditions.push('event = $' + (params.length + 1))
      params.push(filters.event)
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
    
    const rows = await this.client.unsafe(`
      SELECT * FROM events ${whereClause} 
      ORDER BY timestamp DESC
    `, params)
    
    return rows.map((row: any) => ({
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
    
    const rows = await this.client`
      SELECT 
        url,
        COUNT(*) as views,
        AVG(duration) as avg_duration
      FROM events 
      WHERE timestamp >= ${startMs} 
        AND timestamp <= ${endMs} 
        AND event = 'pageview'
      GROUP BY url
      ORDER BY views DESC
      LIMIT ${limit}
    `
    
    return rows.map((row: any) => ({
      url: row.url,
      views: parseInt(row.views),
      avgDuration: parseFloat(row.avg_duration) || 0
    }))
  }

  async queryCountries(start: Date, end: Date, limit = 10): Promise<TCountryStat[]> {
    const startMs = start.getTime()
    const endMs = end.getTime()
    
    const rows = await this.client`
      SELECT 
        ip,
        COUNT(DISTINCT user_id) as users
      FROM events 
      WHERE timestamp >= ${startMs} 
        AND timestamp <= ${endMs}
        AND ip IS NOT NULL
      GROUP BY ip
    `
    
    // Parse IPs to countries and aggregate
    const countryStats = new Map<string, number>()
    
    rows.forEach((row: any) => {
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
    
    const rows = await this.client`
      SELECT 
        user_agent,
        COUNT(DISTINCT user_id) as users
      FROM events 
      WHERE timestamp >= ${startMs} 
        AND timestamp <= ${endMs}
        AND user_agent IS NOT NULL
      GROUP BY user_agent
    `
    
    // Parse user agents and aggregate by browser
    const browserStats = new Map<string, number>()
    
    rows.forEach((row: any) => {
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
    
    const rows = await this.client`
      SELECT 
        user_agent,
        COUNT(DISTINCT user_id) as users
      FROM events 
      WHERE timestamp >= ${startMs} 
        AND timestamp <= ${endMs}
        AND user_agent IS NOT NULL
      GROUP BY user_agent
    `
    
    // Parse user agents and aggregate by device
    const deviceStats = new Map<string, number>()
    
    rows.forEach((row: any) => {
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
    
    const [eventStats, sessionStats] = await Promise.all([
      this.client`
        SELECT 
          COUNT(DISTINCT user_id) as users,
          COUNT(DISTINCT session_id) as sessions,
          COUNT(CASE WHEN event = 'pageview' THEN 1 END) as pageviews
        FROM events 
        WHERE timestamp >= ${startMs} AND timestamp <= ${endMs}
      `,
      this.client`
        SELECT AVG(duration) as avg_duration
        FROM sessions 
        WHERE start_time >= ${startMs} 
          AND start_time <= ${endMs}
          AND duration IS NOT NULL
      `
    ])
    
    const eventRow = eventStats[0]
    const sessionRow = sessionStats[0]
    
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
        await this.client.unsafe(getSchemaVersionSQL().replace('INSERT OR IGNORE', 'INSERT'))
        
        const rows = await this.client`
          SELECT version FROM schema_version ORDER BY version DESC LIMIT 1
        `
        
        return rows.length > 0 ? rows[0].version : 0
      },
      
      runMigration: async (migration) => {
        await this.client.unsafe(migration.sql)
      },
      
      setVersion: async (version) => {
        await this.client`
          INSERT INTO schema_version (version, applied_at)
          VALUES (${version}, ${Date.now()})
          ON CONFLICT (version) DO NOTHING
        `
      }
    }
    
    await runMigrations(migrationRunner)
  }
}
