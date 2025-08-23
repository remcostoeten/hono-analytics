# HONO Analytics

A self-hosted analytics solution built with HONO, TypeScript, and modern web technologies.

## Architecture

This is a monorepo containing:

- **backend/**: HONO-based API server with Postgres/SQLite support
- **sdk/**: TypeScript client SDK for web applications  
- **example/**: Sample React app demonstrating SDK usage

## Features

- ✅ User-centric analytics (not event-centric)
- ✅ Session tracking with 30-min inactivity timeout
- ✅ Developer traffic filtering
- ✅ Geographic data collection
- ✅ Device, browser, and OS detection
- ✅ UTM parameter tracking
- ✅ React provider + vanilla JS support

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd hono-analytics
pnpm install

# Start development
pnpm dev
```

## Database Schema

- **projects**: API key management
- **users**: User identity with device/geo data
- **sessions**: Session management with referrer tracking  
- **pageviews**: Page view events with duration

## API Endpoints

- `POST /track` - Receive analytics data
- `GET /metrics` - Retrieve aggregated metrics

## SDK Usage

### React

```tsx
import { AnalyticsProvider } from '@my-analytics/sdk'

export function App() {
  return (
    <AnalyticsProvider apiKey="your-key" projectId="your-project">
      {/* Your app */}
    </AnalyticsProvider>
  )
}
```

### Vanilla JS

```js
import { initAnalytics } from '@my-analytics/sdk'

initAnalytics({
  apiKey: 'your-key',
  projectId: 'your-project'
})
```

## Development

- Backend runs on http://localhost:8000
- Uses SQLite for local dev, Postgres for production
- Auto-detects localhost traffic as developer activity

## License

MIT
