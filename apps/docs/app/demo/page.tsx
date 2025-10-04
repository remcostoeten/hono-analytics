'use client'

import { 
  DashboardAnalyticsProvider, 
  useAnalytics, 
  useTotals,
  useTimeseries,
  useTopPages 
} from '@hono-analytics/dashboard-hooks'
import { useState } from 'react'

// Mock API endpoint for demo
const DEMO_ENDPOINT = 'https://api.example.com'
const DEMO_API_KEY = 'demo-key-12345'

export default function DemoPage() {
  return (
    <DashboardAnalyticsProvider
      apiKey={DEMO_API_KEY}
      endpoint={DEMO_ENDPOINT}
    >
      <div className="container mx-auto p-8 space-y-8">
        <header>
          <h1 className="text-4xl font-bold mb-2">
            📊 Analytics Dashboard Demo
          </h1>
          <p className="text-muted-foreground">
            Live demonstration of @hono-analytics/dashboard-hooks v0.12.0
          </p>
        </header>

        <div className="grid gap-8">
          <DemoSection title="1. Basic Usage - useTotals()">
            <TotalsDemo />
          </DemoSection>

          <DemoSection title="2. Request Deduplication Test">
            <DeduplicationDemo />
          </DemoSection>

          <DemoSection title="3. Date Range Validation">
            <DateValidationDemo />
          </DemoSection>

          <DemoSection title="4. Polling with Backoff">
            <PollingDemo />
          </DemoSection>

          <DemoSection title="5. Manual Refetch with Loading State">
            <RefetchDemo />
          </DemoSection>

          <DemoSection title="6. Cache Control">
            <CacheControlDemo />
          </DemoSection>
        </div>
      </div>
    </DashboardAnalyticsProvider>
  )
}

function DemoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function TotalsDemo() {
  const { data, loading, error } = useTotals()

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Simple hook to fetch total metrics
      </p>
      
      <div className="bg-muted p-4 rounded font-mono text-sm">
        <pre>{`const { data, loading, error } = useTotals()`}</pre>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Users" value={loading ? '...' : error ? 'Error' : data?.users ?? 'N/A'} />
        <MetricCard label="Sessions" value={loading ? '...' : error ? 'Error' : data?.sessions ?? 'N/A'} />
        <MetricCard label="Page Views" value={loading ? '...' : error ? 'Error' : data?.pageviews ?? 'N/A'} />
        <MetricCard label="Avg Duration" value={loading ? '...' : error ? 'Error' : `${data?.avgDuration ?? 'N/A'}ms`} />
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded text-sm">
          ⚠️ {error}
        </div>
      )}

      <StatusIndicator loading={loading} error={error} />
    </div>
  )
}

function DeduplicationDemo() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Two components using the same hook - only 1 API call is made
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-primary rounded p-4">
          <h3 className="font-semibold mb-2">Component A</h3>
          <DeduplicationChild id="A" />
        </div>
        <div className="border-2 border-secondary rounded p-4">
          <h3 className="font-semibold mb-2">Component B</h3>
          <DeduplicationChild id="B" />
        </div>
      </div>

      <div className="bg-muted p-4 rounded text-sm">
        💡 <strong>Tip:</strong> Check the Network tab in DevTools - you'll see only 1 request, not 2!
      </div>
    </div>
  )
}

function DeduplicationChild({ id }: { id: string }) {
  const { data, loading } = useTotals()
  return (
    <div className="text-sm space-y-2">
      <p>Status: {loading ? '⏳ Loading...' : '✅ Loaded'}</p>
      <p>Users: {data?.users ?? 'N/A'}</p>
      <p className="text-xs text-muted-foreground">Component {id}</p>
    </div>
  )
}

function DateValidationDemo() {
  const [showError, setShowError] = useState(false)

  const tryInvalidRange = () => {
    setShowError(true)
    setTimeout(() => setShowError(false), 3000)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Date ranges are automatically validated (from {'<'} to)
      </p>

      <div className="bg-muted p-4 rounded font-mono text-sm space-y-2">
        <pre>{`// ✅ Valid`}</pre>
        <pre className="text-green-600">{`from: new Date('2024-01-01')`}</pre>
        <pre className="text-green-600">{`to: new Date('2024-12-31')`}</pre>
        
        <pre className="mt-4">{`// ❌ Invalid - throws error`}</pre>
        <pre className="text-destructive">{`from: new Date('2024-12-31')`}</pre>
        <pre className="text-destructive">{`to: new Date('2024-01-01')`}</pre>
      </div>

      <button
        onClick={tryInvalidRange}
        className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition"
      >
        Test Invalid Date Range
      </button>

      {showError && (
        <div className="bg-destructive/10 text-destructive p-4 rounded">
          ❌ Error: Invalid date range: "from" must be before "to"
        </div>
      )}
    </div>
  )
}

function PollingDemo() {
  const [isPolling, setIsPolling] = useState(false)
  const { data, loading, error } = useAnalytics({
    pollingInterval: isPolling ? 10000 : undefined,
    maxRetries: 3
  })

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Polling with exponential backoff on errors (1s → 2s → 4s → 8s → 16s → 30s max)
      </p>

      <div className="bg-muted p-4 rounded font-mono text-sm">
        <pre>{`const { data } = useAnalytics({
  pollingInterval: 10000, // Poll every 10s
  maxRetries: 3           // Stop after 3 failures
})`}</pre>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setIsPolling(!isPolling)}
          className={`px-4 py-2 rounded transition ${
            isPolling 
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {isPolling ? '⏸️ Stop Polling' : '▶️ Start Polling'}
        </button>
      </div>

      <StatusIndicator loading={loading} error={error} polling={isPolling} />

      <div className="bg-muted p-4 rounded text-sm">
        💡 <strong>Tip:</strong> Open Console to see retry attempts with backoff timing
      </div>
    </div>
  )
}

function RefetchDemo() {
  const { data, loading, error, refetch } = useTotals()

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Manual refetch properly updates loading state
      </p>

      <div className="bg-muted p-4 rounded font-mono text-sm">
        <pre>{`const { data, loading, refetch } = useTotals()
        
<button onClick={refetch}>
  {loading ? 'Loading...' : 'Refresh'}
</button>`}</pre>
      </div>

      <button
        onClick={() => refetch()}
        disabled={loading}
        className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '⏳ Loading...' : '🔄 Refresh Now'}
      </button>

      <StatusIndicator loading={loading} error={error} />
    </div>
  )
}

function CacheControlDemo() {
  const [cacheEnabled, setCacheEnabled] = useState(true)
  const [customTTL, setCustomTTL] = useState(5000)
  
  const { data, loading } = useTotals({
    enableCache: cacheEnabled,
    cacheTTL: customTTL
  })

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Configure caching behavior per hook
      </p>

      <div className="bg-muted p-4 rounded font-mono text-sm">
        <pre>{`const { data } = useTotals({
  enableCache: ${cacheEnabled},
  cacheTTL: ${customTTL} // ${customTTL/1000}s
})`}</pre>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={cacheEnabled}
            onChange={(e) => setCacheEnabled(e.target.checked)}
            className="w-4 h-4"
          />
          <span>Enable Cache</span>
        </label>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Cache TTL: {customTTL}ms ({customTTL/1000}s)
          </label>
          <input
            type="range"
            min="1000"
            max="30000"
            step="1000"
            value={customTTL}
            onChange={(e) => setCustomTTL(Number(e.target.value))}
            className="w-full"
            disabled={!cacheEnabled}
          />
        </div>
      </div>

      <div className="bg-muted p-4 rounded text-sm space-y-2">
        <p>Cache Status: {cacheEnabled ? '✅ Enabled' : '❌ Disabled'}</p>
        <p>TTL: {customTTL}ms</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
      </div>
    </div>
  )
}

// Helper Components

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card border rounded-lg p-4">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function StatusIndicator({ 
  loading, 
  error, 
  polling 
}: { 
  loading: boolean
  error: string | null
  polling?: boolean 
}) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
        <span>{loading ? 'Loading' : 'Ready'}</span>
      </div>
      
      {error && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-destructive">Error</span>
        </div>
      )}

      {polling !== undefined && (
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${polling ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
          <span>{polling ? 'Polling Active' : 'Polling Inactive'}</span>
        </div>
      )}
    </div>
  )
}
