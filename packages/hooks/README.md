# @onolythics/hooks

React hooks for building analytics dashboards with Onolythics.

## Installation

```bash
pnpm add @onolythics/hooks
```

## Features

- ✅ **Type-safe hooks** - Full TypeScript support with complete type definitions
- ✅ **Real-time updates** - Optional polling for live dashboard updates
- ✅ **Automatic cleanup** - Handles AbortController and cleanup automatically
- ✅ **Flexible** - Use the main hook or granular hooks for specific data
- ✅ **Zero mock data** - All data comes from real API calls

## Quick Start

### Basic Usage

```tsx
import { useAnalytics } from '@onolythics/hooks'

function AnalyticsDashboard() {
  const { data, loading, error, refetch } = useAnalytics({
    config: {
      apiKey: 'your-api-key',
      endpoint: 'https://your-analytics-api.com'
    }
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!data) return null

  return (
    <div>
      <h1>Analytics</h1>
      <div>Total Users: {data.totals.users}</div>
      <div>Total Pageviews: {data.totals.pageviews}</div>
      <button onClick={refetch}>Refresh</button>
    </div>
  )
}
```

### With Date Range

```tsx
import { useAnalytics } from '@onolythics/hooks'

function Dashboard() {
  const lastWeek = {
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  }

  const { data, loading } = useAnalytics({
    config: {
      apiKey: 'your-api-key',
      endpoint: 'https://your-api-api.com'
    },
    dateRange: lastWeek
  })

  return <div>{data?.totals.users} users this week</div>
}
```

### With Real-time Updates

```tsx
import { useAnalytics } from '@onolythics/hooks'

function LiveDashboard() {
  const { data } = useAnalytics({
    config: {
      apiKey: 'your-api-key',
      endpoint: 'https://your-analytics-api.com'
    },
    pollingInterval: 30000 // Refresh every 30 seconds
  })

  return <div>Live: {data?.totals.sessions} active sessions</div>
}
```

## Hooks API

### `useAnalytics`

Main hook that fetches all analytics data.

```typescript
function useAnalytics(props: {
  config: TAnalyticsConfig
  dateRange?: TDateRange
  pollingInterval?: number
}): THookResponse<TMetricsResponse>
```

**Returns:**
```typescript
{
  data: TMetricsResponse | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}
```

### Granular Hooks

Use specific hooks to fetch only what you need:

#### `useTotals`

```tsx
import { useTotals } from '@onolythics/hooks'

function TotalsCard() {
  const { data, loading } = useTotals({
    config: { apiKey: 'key', endpoint: 'url' }
  })

  if (!data) return null

  return (
    <div>
      <div>Users: {data.users}</div>
      <div>Sessions: {data.sessions}</div>
      <div>Pageviews: {data.pageviews}</div>
      <div>Avg Duration: {data.avgDuration}ms</div>
    </div>
  )
}
```

#### `useTimeseries`

```tsx
import { useTimeseries } from '@onolythics/hooks'

function TimeseriesChart() {
  const { data } = useTimeseries({
    config: { apiKey: 'key', endpoint: 'url' }
  })

  return (
    <div>
      {data?.map((point) => (
        <div key={point.date}>
          {point.date}: {point.pageviews} views
        </div>
      ))}
    </div>
  )
}
```

#### `useTopPages`

```tsx
import { useTopPages } from '@onolythics/hooks'

function TopPagesWidget() {
  const { data } = useTopPages({
    config: { apiKey: 'key', endpoint: 'url' }
  })

  return (
    <ul>
      {data?.map((page) => (
        <li key={page.url}>
          {page.url} - {page.views} views ({page.avgDuration}ms avg)
        </li>
      ))}
    </ul>
  )
}
```

#### `useCountries`

```tsx
import { useCountries } from '@onolythics/hooks'

function CountriesWidget() {
  const { data } = useCountries({
    config: { apiKey: 'key', endpoint: 'url' }
  })

  return (
    <ul>
      {data?.map((country) => (
        <li key={country.country}>
          {country.country}: {country.users} users
        </li>
      ))}
    </ul>
  )
}
```

#### `useBrowsers`

```tsx
import { useBrowsers } from '@onolythics/hooks'

function BrowsersWidget() {
  const { data } = useBrowsers({
    config: { apiKey: 'key', endpoint: 'url' }
  })

  return (
    <ul>
      {data?.map((browser) => (
        <li key={browser.browser}>
          {browser.browser}: {browser.users} users
        </li>
      ))}
    </ul>
  )
}
```

#### `useDevices`

```tsx
import { useDevices } from '@onolythics/hooks'

function DevicesWidget() {
  const { data } = useDevices({
    config: { apiKey: 'key', endpoint: 'url' }
  })

  return (
    <ul>
      {data?.map((device) => (
        <li key={device.device}>
          {device.device}: {device.users} users
        </li>
      ))}
    </ul>
  )
}
```

## Complete Dashboard Example

```tsx
import {
  useAnalytics,
  type TAnalyticsConfig,
  type TDateRange
} from '@onolythics/hooks'

type TProps = {
  config: TAnalyticsConfig
  dateRange: TDateRange
}

export function AnalyticsDashboard({ config, dateRange }: TProps) {
  const { data, loading, error, refetch } = useAnalytics({
    config,
    dateRange,
    pollingInterval: 60000
  })

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-32 rounded" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-800">Error loading analytics: {error}</p>
        <button onClick={refetch} className="mt-2 px-4 py-2 bg-red-600 text-white rounded">
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Totals Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Users</h3>
          <p className="text-3xl font-bold">{data.totals.users.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Sessions</h3>
          <p className="text-3xl font-bold">{data.totals.sessions.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Pageviews</h3>
          <p className="text-3xl font-bold">{data.totals.pageviews.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Avg Duration</h3>
          <p className="text-3xl font-bold">{data.totals.avgDuration}ms</p>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold mb-4">Top Pages</h3>
          <ul className="space-y-2">
            {data.breakdowns.topPages.map((page) => (
              <li key={page.url} className="flex justify-between">
                <span className="truncate">{page.url}</span>
                <span className="font-semibold">{page.views}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold mb-4">Countries</h3>
          <ul className="space-y-2">
            {data.breakdowns.countries.map((country) => (
              <li key={country.country} className="flex justify-between">
                <span>{country.country}</span>
                <span className="font-semibold">{country.users}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
```

## Type Definitions

```typescript
type TAnalyticsConfig = {
  apiKey: string
  endpoint: string
}

type TDateRange = {
  from: Date
  to: Date
}

type THookResponse<T> = {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

type TMetricsResponse = {
  totals: {
    users: number
    sessions: number
    pageviews: number
    avgDuration: number
  }
  timeseries: TTimeseriesDatapoint[]
  breakdowns: {
    topPages: TTopPage[]
    countries: TCountryBreakdown[]
    browsers: TBrowserBreakdown[]
    devices: TDeviceBreakdown[]
  }
}
```

## Best Practices

### 1. Memoize Configuration

```tsx
import { useMemo } from 'react'
import { useAnalytics } from '@onolythics/hooks'

function Dashboard() {
  const config = useMemo(function createConfig() {
    return {
      apiKey: process.env.NEXT_PUBLIC_ANALYTICS_KEY!,
      endpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT!
    }
  }, [])

  const { data } = useAnalytics({ config })
  
  return <div>...</div>
}
```

### 2. Handle SSR in Next.js

```tsx
'use client'

import { useAnalytics } from '@onolythics/hooks'

export function ClientDashboard() {
  const { data, loading } = useAnalytics({
    config: { apiKey: '...', endpoint: '...' }
  })

  if (typeof window === 'undefined') return null
  if (loading) return <div>Loading...</div>

  return <div>...</div>
}
```

### 3. Error Boundaries

```tsx
import { ErrorBoundary } from 'react-error-boundary'

function Dashboard() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <AnalyticsView />
    </ErrorBoundary>
  )
}
```

## License

MIT
