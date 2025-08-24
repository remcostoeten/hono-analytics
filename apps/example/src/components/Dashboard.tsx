import { useState, useEffect } from 'react'

interface MetricsData {
  totals: {
    users: number
    sessions: number
    pageviews: number
    avgDuration: number
  }
  breakdowns: {
    topPages: Array<{ page: string; views: number }>
    countries: Array<{ country: string; views: number }>
    browsers: Array<{ browser: string; views: number }>
    devices: Array<{ device: string; views: number }>
  }
}

export function Dashboard() {
  const [data, setData] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/metrics', {
        headers: {
          'x-api-key': 'dev-key-12345'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const metrics = await response.json()
      setData(metrics)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>📊 Analytics Dashboard</h2>
        <p>Loading analytics data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>📊 Analytics Dashboard</h2>
        <div style={{ 
          background: '#ffebee', 
          color: '#c62828', 
          padding: '1rem', 
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          Error: {error}
        </div>
        <button 
          onClick={fetchMetrics}
          style={{
            padding: '0.5rem 1rem',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>📊 Analytics Dashboard</h2>
        <p>No data available</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>📊 Analytics Dashboard</h2>
        <button 
          onClick={fetchMetrics}
          style={{
            padding: '0.5rem 1rem',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>

      {/* Totals Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Total Users</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#1976d2' }}>
            {data.totals.users.toLocaleString()}
          </p>
        </div>
        <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Sessions</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#4caf50' }}>
            {data.totals.sessions.toLocaleString()}
          </p>
        </div>
        <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Page Views</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#ff9800' }}>
            {data.totals.pageviews.toLocaleString()}
          </p>
        </div>
        <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Avg Duration</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#9c27b0' }}>
            {data.totals.avgDuration}ms
          </p>
        </div>
      </div>

      {/* Breakdowns */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem'
      }}>
        {/* Top Pages */}
        <div style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>🔗 Top Pages</h3>
          {data.breakdowns.topPages.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {data.breakdowns.topPages.map((page, i) => (
                <li key={i} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '0.5rem 0',
                  borderBottom: i < data.breakdowns.topPages.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <span style={{ fontFamily: 'monospace' }}>{page.page}</span>
                  <strong>{page.views}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No page data yet</p>
          )}
        </div>

        {/* Countries */}
        <div style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>🌍 Countries</h3>
          {data.breakdowns.countries.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {data.breakdowns.countries.map((country, i) => (
                <li key={i} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '0.5rem 0',
                  borderBottom: i < data.breakdowns.countries.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <span>{country.country}</span>
                  <strong>{country.views}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No country data yet</p>
          )}
        </div>

        {/* Browsers */}
        <div style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>🌐 Browsers</h3>
          {data.breakdowns.browsers.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {data.breakdowns.browsers.map((browser, i) => (
                <li key={i} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '0.5rem 0',
                  borderBottom: i < data.breakdowns.browsers.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <span>{browser.browser}</span>
                  <strong>{browser.views}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No browser data yet</p>
          )}
        </div>

        {/* Devices */}
        <div style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>📱 Devices</h3>
          {data.breakdowns.devices.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {data.breakdowns.devices.map((device, i) => (
                <li key={i} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '0.5rem 0',
                  borderBottom: i < data.breakdowns.devices.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <span>{device.device}</span>
                  <strong>{device.views}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No device data yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
