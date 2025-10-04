import { useState } from 'react'
import { useAnalyticsActions } from './hooks/useAnalyticsActions'
import { Dashboard } from './components/Dashboard'
import { IntegrationTest } from './components/IntegrationTest'

export function App() {
  const [counter, setCounter] = useState(0)
  const [activeTab, setActiveTab] = useState<'demo' | 'dashboard' | 'test'>('test')
  const { trackCustomEvent, identifyUser, getUserId, getSessionId } = useAnalyticsActions()

  async function handleTrackCustom() {
    await trackCustomEvent()
  }

  function handleIdentify() {
    identifyUser()
  }

  const userId = getUserId()
  const sessionId = getSessionId()

  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1>🔍 HONO Analytics Demo</h1>
      
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: '2px solid #eee'
      }}>
        <button
          onClick={() => setActiveTab('demo')}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            background: activeTab === 'demo' ? '#0066cc' : 'transparent',
            color: activeTab === 'demo' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'demo' ? '2px solid #0066cc' : '2px solid transparent',
            cursor: 'pointer',
            borderRadius: '4px 4px 0 0'
          }}
        >
          Demo & Testing
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            background: activeTab === 'dashboard' ? '#0066cc' : 'transparent',
            color: activeTab === 'dashboard' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'dashboard' ? '2px solid #0066cc' : '2px solid transparent',
            cursor: 'pointer',
            borderRadius: '4px 4px 0 0'
          }}
        >
          Analytics Dashboard
        </button>
        <button
          onClick={() => setActiveTab('test')}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            background: activeTab === 'test' ? '#0066cc' : 'transparent',
            color: activeTab === 'test' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'test' ? '2px solid #0066cc' : '2px solid transparent',
            cursor: 'pointer',
            borderRadius: '4px 4px 0 0'
          }}
        >
          🧪 Integration Test
        </button>
      </div>

      {activeTab === 'demo' && (<div>
      
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
          <li>Switch to the "Analytics Dashboard" tab to see collected data</li>
        </ul>
      </div>
      </div>)}

      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'test' && <IntegrationTest />}
    </div>
  )
}
