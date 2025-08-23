import { useState } from 'react'
import { useAnalytics } from '@hono-analytics/sdk/react'

export function App() {
  const [counter, setCounter] = useState(0)
  const analytics = useAnalytics()

  async function handleTrackCustom() {
    await analytics.track({
      url: '/custom-event',
      durationMs: Math.floor(Math.random() * 5000)
    })
  }

  function handleIdentify() {
    analytics.identify({
      id: 'test-user-123',
      country: 'Netherlands',
      city: 'Amsterdam'
    })
  }

  const userId = analytics.getUserId()
  const sessionId = analytics.getSessionId()

  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>🔍 HONO Analytics Demo</h1>
      
      <div style={{
        background: '#f5f5f5',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h3>Current Session Info</h3>
        <p><strong>User ID:</strong> {userId}</p>
        <p><strong>Session ID:</strong> {sessionId}</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Counter: {counter}</h3>
        <button 
          onClick={() => setCounter(c => c + 1)}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '0.5rem'
          }}
        >
          Increment
        </button>
        <button 
          onClick={() => setCounter(0)}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            background: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Analytics Actions</h3>
        <button 
          onClick={handleTrackCustom}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            background: '#009900',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '0.5rem'
          }}
        >
          Track Custom Event
        </button>
        <button 
          onClick={handleIdentify}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            background: '#cc6600',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Identify User
        </button>
      </div>

      <div style={{
        background: '#e8f4f8',
        padding: '1rem',
        borderRadius: '8px',
        fontSize: '0.9rem'
      }}>
        <h4>📊 How it works:</h4>
        <ul>
          <li>Page views are automatically tracked when you navigate</li>
          <li>User sessions persist for 30 minutes of inactivity</li>
          <li>All events include device, browser, and location data</li>
          <li>Debug mode shows events in console</li>
          <li>Check the backend logs to see incoming requests</li>
        </ul>
      </div>
    </div>
  )
}
