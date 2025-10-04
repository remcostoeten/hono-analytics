# 🔍 Honolytics

A complete analytics solution built with Hono.js, featuring:

- 📊 **Real-time Analytics Collection** - Track pageviews, users, sessions, and custom events
- 🎛️ ** Hooks** - React hooks for building analytics s with centralized configuration
- 🚀 **High Performance** - Built on Hono.js for blazing-fast performance
- 🔒 **Privacy-First** - Self-hosted analytics solution you control
- 📱 **Multi-Platform** - Works with React, Next.js, and vanilla JavaScript

## Quick Start

### 1. Install  Hooks

```bash
bun add @honolytics/hooks
```

### 2. Wrap Your App with Provider

```tsx
import { AnalyticsProvider } from '@honolytics/hooks'

function App() {
  return (
    <AnalyticsProvider
      apiKey="your-api-key-here"
      endpoint="http://localhost:8000"
    >
      < />
    </AnalyticsProvider>
  )
}
```

### 3. Use Analytics Hooks

```tsx
import { useAnalytics, useTotals } from '@honolytics/hooks'

function () {
  const { data, loading, error } = useAnalytics()
  const { data: totals } = useTotals()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Analytics </h1>
      <p>Users: {totals?.users}</p>
      <p>Sessions: {totals?.sessions}</p>
      <p>Page Views: {totals?.pageviews}</p>
    </div>
  )
}
```

## 📦 Packages

### [@honolytics/hooks](./packages/hooks/)

React hooks for building analytics s with centralized configuration.

**Key Features:**
- 🎯 **Centralized Configuration** - Set API config once, use everywhere
- 🔄 **Backward Compatible** - Existing code still works
- 📊 **Specialized Hooks** - Individual hooks for different data slices
- ⚡ **Live Updates** - Built-in polling support
- 🛡️ **TypeScript** - Full type safety

**Available Hooks:**
- `useAnalytics()` - Complete analytics data
- `useTotals()` - Total metrics (users, sessions, pageviews)
- `useTimeseries()` - Time-series data points
- `useTopPages()` - Top pages breakdown
- `useCountries()` - Country breakdown
- `useBrowsers()` - Browser breakdown
- `useDevices()` - Device breakdown

[📖 Full Documentation](./packages/hooks/README.md)


## 🛠️ Development

This project uses a monorepo structure with:
- **Bun** for package management
- **TypeScript** for type safety
- **React** for UI components

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Type check
bun run typecheck
```

## 📊 Usage Examples

### Basic 
```tsx
function Simple() {
  const { data: totals, loading } = useTotals()

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
      <div>Users: {totals?.users}</div>
      <div>Sessions: {totals?.sessions}</div>
      <div>Page Views: {totals?.pageviews}</div>
      <div>Avg Duration: {totals?.avgDuration}ms</div>
    </div>
  )
}
```

### With Date Range
```tsx
function MonthlyReport() {
  const lastMonth = {
    from: new Date(2024, 9, 1),
    to: new Date(2024, 9, 31)
  }

  const { data } = useAnalytics({
    dateRange: lastMonth
  })

  return <div>October 2024 Analytics</div>
}
```

### Live  with Polling
```tsx
function Live() {
  const { data } = useAnalytics({
    pollingInterval: 30000 // Refresh every 30 seconds
  })

  return <div>Live Analytics (auto-refreshing)</div>
}
```


## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using [Hono.js](https://hono.dev) and [React](https://react.dev)