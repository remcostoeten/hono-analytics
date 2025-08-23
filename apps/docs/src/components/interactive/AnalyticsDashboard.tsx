'use client'

import { useState, useEffect } from 'react'

type TMetricsData = {
  totals: {
    users: number
    sessions: number
    pageviews: number
    avgDuration: number
  }
  timeseries: Array<{
    date: string
    users: number
    sessions: number
    pageviews: number
  }>
  breakdowns: {
    topPages: Array<{ url: string; views: number; avgDuration: number }>
    countries: Array<{ country: string; users: number }>
    browsers: Array<{ browser: string; users: number }>
    devices: Array<{ device: string; users: number }>
  }
}

type TRealtimeEvent = {
  id: string
  timestamp: number
  type: 'pageview' | 'identify' | 'session_start'
  data: any
}

type TProps = {
  endpoint?: string
  apiKey?: string
  refreshInterval?: number
  className?: string
}

export function AnalyticsDashboard({ 
  endpoint = 'http://localhost:8000',
  apiKey = 'demo-key',
  refreshInterval = 5000,
  className = ''
}: TProps) {
  const [metrics, setMetrics] = useState<TMetricsData | null>(null)
  const [realtimeEvents, setRealtimeEvents] = useState<TRealtimeEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRange, setSelectedRange] = useState<string>('7d')

  // Simulate real-time events for demo purposes
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        const eventTypes = ['pageview', 'identify', 'session_start'] as const
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
        
        const newEvent: TRealtimeEvent = {
          id: Math.random().toString(36).substring(7),
          timestamp: Date.now(),
          type: randomType,
          data: generateRandomEventData(randomType)
        }

        setRealtimeEvents(prev => [newEvent, ...prev.slice(0, 9)])
      }
    }, 2000 + Math.random() * 3000)

    return () => clearInterval(interval)
  }, [])

  function generateRandomEventData(type: TRealtimeEvent['type']) {
    const countries = ['Netherlands', 'Germany', 'United States', 'United Kingdom', 'France', 'Canada']
    const browsers = ['Chrome 120', 'Safari 17', 'Firefox 118', 'Edge 119']
    const pages = ['/', '/dashboard', '/settings', '/profile', '/docs', '/api-reference']
    
    switch (type) {
      case 'pageview':
        return {
          url: pages[Math.floor(Math.random() * pages.length)],
          country: countries[Math.floor(Math.random() * countries.length)],
          browser: browsers[Math.floor(Math.random() * browsers.length)],
          durationMs: Math.floor(Math.random() * 10000) + 1000
        }
      case 'identify':
        return {
          userId: `user-${Math.floor(Math.random() * 1000)}`,
          country: countries[Math.floor(Math.random() * countries.length)]
        }
      case 'session_start':
        return {
          referrer: Math.random() > 0.5 ? 'google' : 'direct',
          country: countries[Math.floor(Math.random() * countries.length)]
        }
      default:
        return {}
    }
  }

  async function fetchMetrics() {
    setError(null)
    try {
      setIsConnected(true)
      
      // In a real implementation, this would fetch from your actual API
      // For demo purposes, we'll generate mock data
      const mockData: TMetricsData = {
        totals: {
          users: 1250 + Math.floor(Math.random() * 100),
          sessions: 2100 + Math.floor(Math.random() * 200),
          pageviews: 5780 + Math.floor(Math.random() * 500),
          avgDuration: 2340 + Math.floor(Math.random() * 500)
        },
        timeseries: generateTimeseriesData(),
        breakdowns: {
          topPages: [
            { url: '/', views: 890 + Math.floor(Math.random() * 100), avgDuration: 3200 + Math.floor(Math.random() * 800) },
            { url: '/dashboard', views: 456 + Math.floor(Math.random() * 50), avgDuration: 2800 + Math.floor(Math.random() * 600) },
            { url: '/settings', views: 234 + Math.floor(Math.random() * 30), avgDuration: 1900 + Math.floor(Math.random() * 400) },
            { url: '/api-reference', views: 189 + Math.floor(Math.random() * 20), avgDuration: 4100 + Math.floor(Math.random() * 900) }
          ],
          countries: [
            { country: 'Netherlands', users: 456 + Math.floor(Math.random() * 50) },
            { country: 'Germany', users: 234 + Math.floor(Math.random() * 30) },
            { country: 'United States', users: 189 + Math.floor(Math.random() * 20) },
            { country: 'United Kingdom', users: 123 + Math.floor(Math.random() * 15) }
          ],
          browsers: [
            { browser: 'Chrome 120', users: 678 + Math.floor(Math.random() * 70) },
            { browser: 'Safari 17', users: 234 + Math.floor(Math.random() * 30) },
            { browser: 'Firefox 118', users: 156 + Math.floor(Math.random() * 20) },
            { browser: 'Edge 119', users: 89 + Math.floor(Math.random() * 10) }
          ],
          devices: [
            { device: 'desktop', users: 789 + Math.floor(Math.random() * 80) },
            { device: 'mobile', users: 461 + Math.floor(Math.random() * 50) },
            { device: 'tablet', users: 123 + Math.floor(Math.random() * 15) }
          ]
        }
      }

      setMetrics(mockData)
    } catch (err) {
      setError('Failed to fetch analytics data')
      setIsConnected(false)
    }
  }

  function generateTimeseriesData() {
    const days = selectedRange === '7d' ? 7 : selectedRange === '30d' ? 30 : 90
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      data.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 100) + 20,
        sessions: Math.floor(Math.random() * 150) + 30,
        pageviews: Math.floor(Math.random() * 300) + 80
      })
    }
    
    return data
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, refreshInterval)
    return () => clearInterval(interval)
  }, [selectedRange, refreshInterval])

  function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  function getEventIcon(type: TRealtimeEvent['type']): string {
    switch (type) {
      case 'pageview': return '👁️'
      case 'identify': return '👤'
      case 'session_start': return '🚀'
      default: return '📊'
    }
  }

  function getEventColor(type: TRealtimeEvent['type']): string {
    switch (type) {
      case 'pageview': return 'bg-blue-950/20 border-blue-700/50'
      case 'identify': return 'bg-emerald-950/20 border-emerald-700/50'
      case 'session_start': return 'bg-purple-950/20 border-purple-700/50'
      default: return 'bg-neutral-800/50 border-neutral-700/50'
    }
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-fd-muted-foreground">Loading analytics dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`analytics-dashboard ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-950/20 to-purple-950/20 rounded-lg border border-fd-border">
        <div>
          <h3 className="text-lg font-semibold text-fd-foreground">
            📊 Real-time Analytics Dashboard
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <span className="text-sm text-fd-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'} • Last updated {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="px-3 py-1.5 text-sm border border-fd-border bg-fd-background text-fd-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={fetchMetrics}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-950/20 border border-red-700/50 rounded-lg text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Key Metrics */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-fd-card border border-fd-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-fd-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-fd-foreground">{formatNumber(metrics.totals.users)}</p>
              </div>
              <div className="text-2xl">👥</div>
            </div>
            <div className="mt-2 text-xs text-emerald-400">
              +{Math.floor(Math.random() * 20) + 5}% from last period
            </div>
          </div>

          <div className="bg-fd-card border border-fd-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-fd-muted-foreground">Sessions</p>
                <p className="text-2xl font-bold text-fd-foreground">{formatNumber(metrics.totals.sessions)}</p>
              </div>
              <div className="text-2xl">🔗</div>
            </div>
            <div className="mt-2 text-xs text-emerald-400">
              +{Math.floor(Math.random() * 15) + 3}% from last period
            </div>
          </div>

          <div className="bg-fd-card border border-fd-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-fd-muted-foreground">Pageviews</p>
                <p className="text-2xl font-bold text-fd-foreground">{formatNumber(metrics.totals.pageviews)}</p>
              </div>
              <div className="text-2xl">📄</div>
            </div>
            <div className="mt-2 text-xs text-blue-400">
              +{Math.floor(Math.random() * 25) + 8}% from last period
            </div>
          </div>

          <div className="bg-fd-card border border-fd-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-fd-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold text-fd-foreground">{formatDuration(metrics.totals.avgDuration)}</p>
              </div>
              <div className="text-2xl">⏱️</div>
            </div>
            <div className="mt-2 text-xs text-purple-400">
              +{Math.floor(Math.random() * 10) + 2}% from last period
            </div>
          </div>
        </div>

        {/* Real-time Events */}
        <div className="bg-fd-card border border-fd-border rounded-lg overflow-hidden">
          <div className="bg-fd-muted/30 px-4 py-3 border-b border-fd-border">
            <h4 className="font-semibold text-fd-foreground flex items-center">
              🔴 Live Events
              <span className="ml-2 animate-pulse w-2 h-2 bg-red-400 rounded-full" />
            </h4>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {realtimeEvents.length === 0 ? (
              <p className="text-fd-muted-foreground text-sm text-center py-8">
                Waiting for events...
              </p>
            ) : (
              <div className="space-y-3">
                {realtimeEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border transition-all duration-300 ${getEventColor(event.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getEventIcon(event.type)}</span>
                        <div>
                          <div className="text-sm font-medium capitalize text-fd-foreground">
                            {event.type.replace('_', ' ')}
                          </div>
                          <div className="text-xs text-fd-muted-foreground mt-0.5">
                            {event.type === 'pageview' && `${event.data.url} • ${event.data.browser}`}
                            {event.type === 'identify' && `User ${event.data.userId} • ${event.data.country}`}
                            {event.type === 'session_start' && `From ${event.data.referrer} • ${event.data.country}`}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-fd-muted-foreground">
                        {Math.floor((Date.now() - event.timestamp) / 1000)}s ago
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts and Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Top Pages */}
        <div className="bg-fd-card border border-fd-border rounded-lg overflow-hidden">
          <div className="bg-fd-muted/30 px-4 py-3 border-b border-fd-border">
            <h4 className="font-semibold text-fd-foreground">📈 Top Pages</h4>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {metrics.breakdowns.topPages.map((page, index) => (
                <div key={page.url} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-fd-muted-foreground">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-fd-foreground">{page.url}</div>
                      <div className="text-xs text-fd-muted-foreground">
                        Avg time: {formatDuration(page.avgDuration)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-blue-400">
                    {formatNumber(page.views)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-fd-card border border-fd-border rounded-lg overflow-hidden">
          <div className="bg-fd-muted/30 px-4 py-3 border-b border-fd-border">
            <h4 className="font-semibold text-fd-foreground">🌍 Top Countries</h4>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {metrics.breakdowns.countries.map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-fd-muted-foreground">
                      #{index + 1}
                    </div>
                    <div className="text-sm font-medium text-fd-foreground">{country.country}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold text-emerald-400">
                      {formatNumber(country.users)}
                    </div>
                    <div 
                      className="h-2 bg-emerald-900/30 rounded-full"
                      style={{ 
                        width: `${Math.max(20, (country.users / Math.max(...metrics.breakdowns.countries.map(c => c.users))) * 60)}px` 
                      }}
                    >
                      <div 
                        className="h-2 bg-emerald-400 rounded-full"
                        style={{ 
                          width: `${(country.users / Math.max(...metrics.breakdowns.countries.map(c => c.users))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Browsers */}
        <div className="bg-fd-card border border-fd-border rounded-lg overflow-hidden">
          <div className="bg-fd-muted/30 px-4 py-3 border-b border-fd-border">
            <h4 className="font-semibold text-fd-foreground">🌐 Top Browsers</h4>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {metrics.breakdowns.browsers.map((browser, index) => (
                <div key={browser.browser} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-fd-muted-foreground">
                      #{index + 1}
                    </div>
                    <div className="text-sm font-medium text-fd-foreground">{browser.browser}</div>
                  </div>
                  <div className="text-sm font-bold text-purple-400">
                    {formatNumber(browser.users)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Devices */}
        <div className="bg-fd-card border border-fd-border rounded-lg overflow-hidden">
          <div className="bg-fd-muted/30 px-4 py-3 border-b border-fd-border">
            <h4 className="font-semibold text-fd-foreground">📱 Device Types</h4>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {metrics.breakdowns.devices.map((device, index) => (
                <div key={device.device} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-fd-muted-foreground">
                      #{index + 1}
                    </div>
                    <div className="text-sm font-medium capitalize text-fd-foreground">{device.device}</div>
                  </div>
                  <div className="text-sm font-bold text-orange-400">
                    {formatNumber(device.users)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .analytics-dashboard {
          font-family: system-ui, -apple-system, sans-serif;
        }
      `}</style>
    </div>
  )
}
