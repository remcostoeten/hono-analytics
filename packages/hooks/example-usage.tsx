import { HonolyticsProvider, useAnalytics, useTotals, useTopPages } from './src/index'
// Clean, simple example with centralized configuration
function App() {
  return (
    <HonolyticsProvider
      apiKey="dev-key-12345"
      endpoint="http://localhost:8000"
    >
      <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <h1>🔍 Honolytics Demo</h1>
        <Simple />
        <Detailed />
      </div>
    </HonolyticsProvider>
  )
}

// Simple  - no config needed
function Simple() {
  const { data: totals, loading, error } = useTotals()

  if (loading) return <div>Loading totals...</div>
  if (error) return <div>Error: {error}</div>
  if (!totals) return <div>No data</div>

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2>📊 Quick Stats</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
          <h3>Users</h3>
          <p style={{ fontSize: '2rem', margin: 0 }}>{totals.users}</p>
        </div>
        <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
          <h3>Sessions</h3>
          <p style={{ fontSize: '2rem', margin: 0 }}>{totals.sessions}</p>
        </div>
        <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
          <h3>Page Views</h3>
          <p style={{ fontSize: '2rem', margin: 0 }}>{totals.pageviews}</p>
        </div>
        <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
          <h3>Avg Duration</h3>
          <p style={{ fontSize: '2rem', margin: 0 }}>{totals.avgDuration}ms</p>
        </div>
      </div>
    </div>
  )
}

// Detailed  with live updates
function Detailed() {
  const { data: analytics, refetch } = useAnalytics({
    pollingInterval: 30000 // Auto-refresh every 30 seconds
  })
  const { data: topPages } = useTopPages()

  if (!analytics) return null

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>📈 Detailed Analytics</h2>
        <button 
          onClick={refetch}
          style={{
            padding: '0.5rem 1rem',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Now
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h3>🔗 Top Pages</h3>
          {topPages && topPages.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {topPages.map((page, i) => (
                <li 
                  key={i} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <span>{page.url}</span>
                  <strong>{page.views} views</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>No page data available</p>
          )}
        </div>

        <div>
          <h3>📊 Timeseries Data</h3>
          {analytics.timeseries.length > 0 ? (
            <div>
              {analytics.timeseries.slice(-5).map((point, i) => (
                <div key={i} style={{ marginBottom: '0.5rem' }}>
                  <strong>{point.date}</strong>: {point.users} users, {point.pageviews} views
                </div>
              ))}
            </div>
          ) : (
            <p>No timeseries data available</p>
          )}
        </div>
      </div>
    </div>
  )
}


export default App