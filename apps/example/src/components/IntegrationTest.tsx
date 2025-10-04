import { useState } from 'react'
import { useAnalytics, useTopPages, useCountries } from '@onolythics/hooks'
import type { TAnalyticsConfig } from '@onolythics/hooks'

type TTestResult = {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  data?: unknown
}

export function IntegrationTest() {
  const [testResults, setTestResults] = useState<TTestResult[]>([])
  const [testing, setTesting] = useState(false)

  const config: TAnalyticsConfig = {
    apiKey: 'dev-integration-test-key-12345',
    endpoint: 'http://localhost:8000'
  }

  const { data, loading, error, refetch } = useAnalytics({ config })
  const { data: topPages } = useTopPages({ config })
  const { data: countries } = useCountries({ config })

  async function runIntegrationTests() {
    setTesting(true)
    const results: TTestResult[] = []

    results.push({
      name: 'Backend Health Check',
      status: 'pending',
      message: 'Checking if backend is running...'
    })
    setTestResults([...results])

    try {
      const healthResponse = await fetch('http://localhost:8000/health')
      if (healthResponse.ok) {
        results[0].status = 'success'
        results[0].message = 'Backend is running'
        results[0].data = await healthResponse.json()
      } else {
        throw new Error(`Backend returned ${healthResponse.status}`)
      }
    } catch (err) {
      results[0].status = 'error'
      results[0].message = err instanceof Error ? err.message : 'Failed to connect'
      setTestResults([...results])
      setTesting(false)
      return
    }

    setTestResults([...results])

    results.push({
      name: 'Send Test Event',
      status: 'pending',
      message: 'Sending test tracking event...'
    })
    setTestResults([...results])

    try {
      const trackResponse = await fetch('http://localhost:8000/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'dev-integration-test-key-12345'
        },
        body: JSON.stringify({
          url: '/integration-test',
          referrer: 'https://example.com',
          userAgent: navigator.userAgent,
          sessionId: 'test-session-' + Date.now(),
          userId: 'test-user-' + Date.now()
        })
      })

      if (trackResponse.ok) {
        results[1].status = 'success'
        results[1].message = 'Event tracked successfully'
        results[1].data = await trackResponse.json()
      } else {
        throw new Error(`Track endpoint returned ${trackResponse.status}`)
      }
    } catch (err) {
      results[1].status = 'error'
      results[1].message = err instanceof Error ? err.message : 'Failed to track'
    }

    setTestResults([...results])

    await new Promise(resolve => setTimeout(resolve, 1000))

    results.push({
      name: 'Fetch Metrics with useAnalytics',
      status: 'pending',
      message: 'Using @onolythics/hooks to fetch data...'
    })
    setTestResults([...results])

    try {
      await refetch()
      
      if (data) {
        results[2].status = 'success'
        results[2].message = `Fetched: ${data.totals.users} users, ${data.totals.sessions} sessions, ${data.totals.pageviews} pageviews`
        results[2].data = data.totals
      } else {
        throw new Error('No data returned from hooks')
      }
    } catch (err) {
      results[2].status = 'error'
      results[2].message = err instanceof Error ? err.message : 'Hook fetch failed'
    }

    setTestResults([...results])

    results.push({
      name: 'Granular Hooks Test',
      status: 'pending',
      message: 'Testing useTopPages and useCountries...'
    })
    setTestResults([...results])

    if (topPages || countries) {
      results[3].status = 'success'
      results[3].message = `Top pages: ${topPages?.length || 0}, Countries: ${countries?.length || 0}`
      results[3].data = { topPages, countries }
    } else {
      results[3].status = 'error'
      results[3].message = 'Granular hooks returned no data'
    }

    setTestResults([...results])

    results.push({
      name: 'Data Accuracy Check',
      status: 'pending',
      message: 'Verifying data types and structure...'
    })
    setTestResults([...results])

    try {
      if (!data) throw new Error('No data to verify')
      
      const checks = [
        typeof data.totals.users === 'number',
        typeof data.totals.sessions === 'number',
        typeof data.totals.pageviews === 'number',
        typeof data.totals.avgDuration === 'number',
        Array.isArray(data.timeseries),
        Array.isArray(data.breakdowns.topPages),
        Array.isArray(data.breakdowns.countries)
      ]

      if (checks.every(check => check)) {
        results[4].status = 'success'
        results[4].message = 'All data types are correct'
      } else {
        throw new Error('Data type mismatch detected')
      }
    } catch (err) {
      results[4].status = 'error'
      results[4].message = err instanceof Error ? err.message : 'Verification failed'
    }

    setTestResults([...results])
    setTesting(false)
  }

  function getStatusColor(status: TTestResult['status']) {
    switch (status) {
      case 'success': return '#4caf50'
      case 'error': return '#f44336'
      case 'pending': return '#ff9800'
    }
  }

  function getStatusIcon(status: TTestResult['status']) {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'pending': return '⏳'
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>🧪 Onolythics Integration Test</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        End-to-end test of tracking, hooks, and data accuracy
      </p>

      <button
        onClick={runIntegrationTests}
        disabled={testing}
        style={{
          padding: '1rem 2rem',
          background: testing ? '#ccc' : '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: testing ? 'not-allowed' : 'pointer',
          marginBottom: '2rem'
        }}
      >
        {testing ? '🔄 Running Tests...' : '▶️ Run Integration Tests'}
      </button>

      {testResults.length > 0 && (
        <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0 }}>Test Results</h3>
          {testResults.map((result, i) => (
            <div
              key={i}
              style={{
                background: 'white',
                padding: '1rem',
                borderRadius: '4px',
                marginBottom: '0.5rem',
                borderLeft: `4px solid ${getStatusColor(result.status)}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{getStatusIcon(result.status)}</span>
                <strong>{result.name}</strong>
              </div>
              <p style={{ margin: '0.5rem 0 0 2rem', color: '#666' }}>{result.message}</p>
              {result.data && (
                <pre style={{ 
                  background: '#f0f0f0', 
                  padding: '0.5rem', 
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  overflow: 'auto',
                  marginTop: '0.5rem',
                  marginLeft: '2rem'
                }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#fff3cd', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>📊 Live Hook Data</h3>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: '#d32f2f' }}>Error: {error}</p>}
        {data && (
          <div>
            <p><strong>Users:</strong> {data.totals.users}</p>
            <p><strong>Sessions:</strong> {data.totals.sessions}</p>
            <p><strong>Pageviews:</strong> {data.totals.pageviews}</p>
            <p><strong>Avg Duration:</strong> {data.totals.avgDuration}ms</p>
          </div>
        )}
      </div>
    </div>
  )
}
