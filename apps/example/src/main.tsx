import { createRoot } from 'react-dom/client'
import { AnalyticsProvider } from '@onolythics/sdk/react'
import { App } from './App.tsx'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

const root = createRoot(rootElement)

root.render(
  <AnalyticsProvider
    apiKey="dev-key-12345"
    projectId="default-project"
    endpoint="http://localhost:8000"
    debug={true}
  >
    <App />
  </AnalyticsProvider>
)
