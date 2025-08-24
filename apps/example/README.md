# HONO Analytics Example

This is a React example application demonstrating the HONO Analytics SDK usage.

## Quick Start

### Option 1: Run with Backend (Recommended)

```bash
# From the example directory
pnpm run dev:with-backend
```

This will start both:
- **Backend API** on http://localhost:8000
- **Frontend App** on http://localhost:3000

### Option 2: Run from Root Directory

```bash
# From the project root
./run-example.sh
```

### Option 3: Frontend Only

```bash
# From the example directory
pnpm run dev
```

Note: Without the backend, analytics requests will fail with connection errors.

## Features Demonstrated

### ✅ Analytics Tracking
- **Automatic page view tracking** when the app loads
- **Custom event tracking** via "Track Custom Event" button
- **User identification** via "Identify User" button
- **Session management** with persistent user sessions

### ✅ React Integration
- **Custom Hook Pattern**: Analytics logic extracted to `useAnalyticsActions` hook
- **Provider Pattern**: App wrapped with `AnalyticsProvider`
- **TypeScript Support**: Fully typed analytics API

### ✅ Development Features
- **Debug Mode**: Console logging of analytics events
- **Error Handling**: Graceful degradation when backend is unavailable
- **Hot Reload**: Changes to SDK are automatically picked up

## Analytics Events

The example demonstrates these analytics patterns:

```typescript
// Custom event tracking
await analytics.track({
  url: '/custom-event',
  durationMs: Math.floor(Math.random() * 5000)
})

// User identification
analytics.identify({
  id: 'test-user-123',
  country: 'Netherlands',
  city: 'Amsterdam'
})

// Session information
const userId = analytics.getUserId()
const sessionId = analytics.getSessionId()
```

## Architecture

```
📁 apps/example/src/
├── 📄 main.tsx              # App entry point with AnalyticsProvider
├── 📄 App.tsx               # Main component using analytics
└── 📁 hooks/
    └── 📄 useAnalyticsActions.ts  # Extracted analytics logic
```

## Backend Integration

The example connects to the HONO Analytics backend running on port 8000. The backend provides:

- **POST /track** - Analytics event ingestion
- **GET /health** - Health check endpoint
- **GET /** - API documentation

## Environment Variables

No environment variables required for local development. The example uses hardcoded development values:

```typescript
<AnalyticsProvider
  apiKey="dev-key-12345"
  projectId="default-project"
  endpoint="http://localhost:8000"
  debug={true}
>
```

## Troubleshooting

### Connection Refused Errors
If you see `ERR_CONNECTION_REFUSED` errors:
1. Make sure the backend is running on port 8000
2. Use `pnpm run dev:with-backend` to start both services

### Analytics Provider Errors
If you see `useAnalytics must be used within an AnalyticsProvider`:
1. The provider should automatically handle this gracefully
2. Check that your component is wrapped with `AnalyticsProvider`

### Database Errors
✅ **Fixed**: UUID validation errors have been resolved.
- The SDK now generates proper UUIDs for user identification
- Analytics events should be successfully stored in the database
- If you still see UUID errors, ensure you're using the latest SDK build
