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

type TProps = {
  endpoint?: string
  apiKey?: string
  refreshInterval?: number
  className?: string
}

export function AnalyticsDashboard({ 
  endpoint = 'http://localhost:8000',
  apiKey = 'dev-key-12345',
  refreshInterval = 30000,
  className = ''
}: TProps) {
  const [metrics, setMetrics] = useState<TMetricsData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRange, setSelectedRange] = useState<string>('7d')
  const [isLoading, setIsLoading] = useState(false)

  async function fetchMetrics() {
    setError(null)
    setIsLoading(true)
    
    try {
      const response = await fetch(`${endpoint}/metrics?range=${selectedRange}&exclude_dev=true`, {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key')
        }
        if (response.status === 404) {
          throw new Error('Metrics endpoint not found')
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setMetrics(data)
      setIsConnected(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics data'
      setError(errorMessage)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, refreshInterval)
    return () => clearInterval(interval)
  }, [selectedRange, refreshInterval, endpoint, apiKey])

  function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  function formatDuration(ms: number): string {
    if (!ms || ms === 0) return '0s'
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-fd-muted-foreground">Loading analytics dashboard...</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-fd-muted-foreground mb-4">No analytics data available</p>
          <button
            onClick={fetchMetrics}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            🔄 Retry
          </button>
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
            📊 Analytics Dashboard
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
            disabled={isLoading}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
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
        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-fd-card border border-fd-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-fd-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-fd-foreground">{formatNumber(metrics.totals.users)}</p>
              </div>
              <div className="text-2xl">👥</div>
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
          </div>

          <div className="bg-fd-card border border-fd-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-fd-muted-foreground">Pageviews</p>
                <p className="text-2xl font-bold text-fd-foreground">{formatNumber(metrics.totals.pageviews)}</p>
              </div>
              <div className="text-2xl">📄</div>
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
            {metrics.breakdowns.topPages.length === 0 ? (
              <p className="text-fd-muted-foreground text-sm text-center py-8">
                No page data available
              </p>
            ) : (
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
            )}
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-fd-card border border-fd-border rounded-lg overflow-hidden">
          <div className="bg-fd-muted/30 px-4 py-3 border-b border-fd-border">
            <h4 className="font-semibold text-fd-foreground">🌍 Top Countries</h4>
          </div>
          <div className="p-4">
            {metrics.breakdowns.countries.length === 0 ? (
              <p className="text-fd-muted-foreground text-sm text-center py-8">
                No country data available
              </p>
            ) : (
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
            )}
          </div>
        </div>

        {/* Browsers */}
        <div className="bg-fd-card border border-fd-border rounded-lg overflow-hidden">
          <div className="bg-fd-muted/30 px-4 py-3 border-b border-fd-border">
            <h4 className="font-semibold text-fd-foreground">🌐 Top Browsers</h4>
          </div>
          <div className="p-4">
            {metrics.breakdowns.browsers.length === 0 ? (
              <p className="text-fd-muted-foreground text-sm text-center py-8">
                No browser data available
              </p>
            ) : (
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
            )}
          </div>
        </div>

        {/* Devices */}
        <div className="bg-fd-card border border-fd-border rounded-lg overflow-hidden">
          <div className="bg-fd-muted/30 px-4 py-3 border-b border-fd-border">
            <h4 className="font-semibold text-fd-foreground">📱 Device Types</h4>
          </div>
          <div className="p-4">
            {metrics.breakdowns.devices.length === 0 ? (
              <p className="text-fd-muted-foreground text-sm text-center py-8">
                No device data available
              </p>
            ) : (
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
            )}
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