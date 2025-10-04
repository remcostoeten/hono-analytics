# @hono-analytics/dashboard-hooks

React hooks for analytics dashboard data with centralized configuration.

## Installation

```bash
bun add @hono-analytics/dashboard-hooks
```

## Usage

### 1. Wrap Your App

```tsx
import { DashboardAnalyticsProvider } from '@hono-analytics/dashboard-hooks'

function App() {
  return (
    <DashboardAnalyticsProvider
      apiKey="your-api-key-here"
      endpoint="http://localhost:8000"
    >
      <Dashboard />
    </DashboardAnalyticsProvider>
  )
}
```

### 2. Use Analytics Hooks

```tsx
import { useAnalytics, useTotals } from '@hono-analytics/dashboard-hooks'

function Dashboard() {
  const { data, loading, error } = useAnalytics()
  const { data: totals } = useTotals()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <p>Users: {totals?.users}</p>
      <p>Sessions: {totals?.sessions}</p>
      <p>Page Views: {totals?.pageviews}</p>
    </div>
  )
}
```

## Available Hooks

All hooks require `DashboardAnalyticsProvider` and support date range filtering and polling:

### Core Hook
- `useAnalytics(options?)` - Complete analytics data

### Metric Slice Hooks
- `useTotals(options?)` - Total metrics (users, sessions, pageviews, avgDuration)
- `useTimeseries(options?)` - Time-series data points
- `useTopPages(options?)` - Top pages breakdown
- `useCountries(options?)` - Country breakdown
- `useBrowsers(options?)` - Browser breakdown  
- `useDevices(options?)` - Device breakdown

### Configuration Hook
- `useDashboardConfig()` - Access current context configuration

## Hook Options

All hooks accept the same options object:

```tsx
type HookOptions = {
  dateRange?: {
    from: Date
    to: Date
  }
  pollingInterval?: number // milliseconds
  maxRetries?: number // default: 3
  enableCache?: boolean // default: true
  cacheTTL?: number // milliseconds, default: 5000
}
```

## Examples

### With Date Range

```tsx
function MonthlyReport() {
  const lastMonth = {
    from: new Date(2023, 11, 1),
    to: new Date(2023, 11, 31)
  }

  const { data } = useAnalytics({
    dateRange: lastMonth
  })

  return <div>Last month's analytics...</div>
}
```

### With Polling

```tsx
function LiveDashboard() {
  const { data } = useAnalytics({
    pollingInterval: 30000 // Poll every 30 seconds
  })

  return <div>Live analytics data (auto-refreshing)...</div>
}
```

### Advanced Options

```tsx
function Dashboard() {
  const { data, loading, error, refetch } = useAnalytics({
    pollingInterval: 30000,
    maxRetries: 5, // Retry up to 5 times with exponential backoff
    enableCache: true, // Enable request deduplication
    cacheTTL: 10000 // Cache responses for 10 seconds
  })

  return <div>Analytics dashboard...</div>
}
```

### Error Handling

```tsx
function Dashboard() {
  const { data, loading, error, refetch } = useAnalytics()

  if (loading) return <div>Loading analytics...</div>
  
  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    )
  }

  return <div>Analytics dashboard...</div>
}
```

### Request Deduplication

By default, the hooks automatically deduplicate identical requests across components:

```tsx
// Both components share the same request - only 1 API call is made
function ComponentA() {
  const { data } = useAnalytics()
  // ...
}

function ComponentB() {
  const { data } = useAnalytics() // Uses cached result
  // ...
}
```

Disable caching if needed:
```tsx
const { data } = useAnalytics({ enableCache: false })
```


## TypeScript Support

Full TypeScript support with strict typing:

```tsx
import type { 
  TMetricsResponse, 
  TDashboardConfig,
  TDateRange 
} from '@hono-analytics/dashboard-hooks'

const config: TDashboardConfig = {
  apiKey: 'key',
  endpoint: 'http://localhost:8000'
}
```

## Error Messages

If you forget to wrap your app in the provider, you'll get a helpful error:

```
useAnalytics must be used within DashboardAnalyticsProvider
```
