# HONO Analytics

A self-hosted analytics solution built with HONO, TypeScript, and modern web technologies. Designed to be privacy-focused, lightweight, and developer-friendly.

## Architecture

This is a monorepo containing:

- **backend/**: HONO-based API server with Postgres/SQLite support
- **sdk/**: TypeScript client SDK for web applications  
- **example/**: Sample React app demonstrating SDK usage

## Features

- ✅ **User-centric analytics** (not event-centric)
- ✅ **Session tracking** with 30-min inactivity timeout
- ✅ **Developer traffic filtering** with automatic localhost detection
- ✅ **Geographic data collection** with country/city tracking
- ✅ **Device, browser, and OS detection** using user agent parsing
- ✅ **UTM parameter tracking** for campaign attribution
- ✅ **React provider + vanilla JS support** for all frameworks
- ✅ **Privacy-focused** with user consent and data control
- ✅ **Self-hosted** - your data stays on your servers
- ✅ **TypeScript-first** with full type safety

## Quick Start

```bash
# Clone and install
git clone https://github.com/your-org/onolythics.git
cd onolythics
pnpm install

# Start development environment (requires Docker for PostgreSQL)
./dev.sh

# Or use SQLite fallback
DATABASE_URL="sqlite:./backend/analytics.db" ./dev.sh
```

This will start:
- Backend API server on http://localhost:8000
- Example React app on http://localhost:3000
- PostgreSQL database (or SQLite if Docker unavailable)

## Installation

### Backend Setup

1. **Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Database Setup**
   ```bash
   # For PostgreSQL
   docker-compose up -d postgres
   
   # For SQLite (no Docker required)
   export DATABASE_URL="sqlite:./backend/analytics.db"
   ```

3. **Run Migrations**
   ```bash
   cd backend
   pnpm db:generate
   pnpm db:migrate
   ```

4. **Start Backend**
   ```bash
   pnpm dev
   ```

### SDK Integration

#### React/Next.js

```tsx
import { AnalyticsProvider } from '@onolythics/sdk/react'

export function App() {
  return (
    <AnalyticsProvider 
      apiKey="your-api-key"
      projectId="your-project-id"
      endpoint="https://your-analytics-api.com"
      debug={process.env.NODE_ENV === 'development'}
    >
      <YourApp />
    </AnalyticsProvider>
  )
}

// In your components
import { useAnalytics } from '@onolythics/sdk/react'

function MyComponent() {
  const analytics = useAnalytics()
  
  const handleCustomEvent = async () => {
    await analytics.track({
      url: '/custom-action',
      durationMs: 1000
    })
  }
  
  const handleIdentifyUser = () => {
    analytics.identify({
      id: 'user-123',
      country: 'Netherlands',
      city: 'Amsterdam'
    })
  }
  
  return (
    <button onClick={handleCustomEvent}>
      Track Custom Event
    </button>
  )
}
```

#### Vanilla JavaScript

```js
import { initAnalytics, track, identify } from '@onolythics/sdk'

// Initialize
const analytics = initAnalytics({
  apiKey: 'your-api-key',
  projectId: 'your-project-id',
  endpoint: 'https://your-analytics-api.com'
})

// Track custom events
await track({
  url: '/button-clicked',
  durationMs: 500
})

// Identify users
identify({
  id: 'user-123',
  country: 'Netherlands'
})
```

## Database Schema

### Projects Table
```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Users Table  
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  first_seen TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  device TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  lat REAL,
  lng REAL,
  is_dev BOOLEAN DEFAULT FALSE
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  referrer TEXT,
  origin TEXT
);
```

### Pageviews Table
```sql
CREATE TABLE pageviews (
  id SERIAL PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  url TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  duration_ms INTEGER
);
```

## API Reference

### POST /track

Receive analytics events from the SDK.

**Headers:**
- `x-api-key`: Your project API key
- `x-dev-traffic`: "true" to mark as developer traffic (optional)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "user": {
    "id": "user-uuid",
    "device": "desktop",
    "browser": "Chrome 120",
    "os": "macOS 14",
    "country": "Netherlands",
    "city": "Amsterdam",
    "lat": 52.3676,
    "lng": 4.9041
  },
  "session": {
    "id": "session-uuid",
    "referrer": "https://google.com",
    "origin": "google"
  },
  "pageview": {
    "url": "https://example.com/page",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "durationMs": 5000
  }
}
```

**Response:**
- `204 No Content` on success
- `401 Unauthorized` for invalid API key
- `400 Bad Request` for malformed data

### GET /metrics

Retrieve aggregated analytics data.

**Headers:**
- `x-api-key`: Your project API key

**Query Parameters:**
- `range`: Time range (e.g., "7d", "30d", "1y") - defaults to "7d"
- `exclude_dev`: "true" to exclude developer traffic - defaults to "true"

**Response:**
```json
{
  "totals": {
    "users": 1250,
    "sessions": 2100,
    "pageviews": 5780,
    "avgDuration": 2340
  },
  "timeseries": [
    {
      "date": "2024-01-01",
      "users": 45,
      "sessions": 67,
      "pageviews": 142
    }
  ],
  "breakdowns": {
    "topPages": [
      {
        "url": "/",
        "views": 890,
        "avgDuration": 3200
      }
    ],
    "countries": [
      {
        "country": "Netherlands",
        "users": 456
      }
    ],
    "browsers": [
      {
        "browser": "Chrome 120",
        "users": 678
      }
    ],
    "devices": [
      {
        "device": "desktop",
        "users": 789
      }
    ]
  }
}
```

## SDK Configuration

### AnalyticsOptions

```typescript
type TAnalyticsOptions = {
  apiKey: string              // Your project API key
  projectId: string           // Your project ID
  endpoint?: string           // API endpoint (default: http://localhost:8000)
  ignoreAnalytics?: boolean   // Disable tracking entirely
  debug?: boolean             // Enable debug logging
}
```

### React Provider Props

```typescript
type TProps = {
  children: ReactNode
  apiKey: string
  projectId: string  
  endpoint?: string
  ignoreAnalytics?: boolean
  debug?: boolean
}
```

## Development

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- Docker (optional, for PostgreSQL)

### Project Structure

```
onolythics/
├── backend/           # HONO API server
│   ├── src/
│   │   ├── db/        # Database schema and client
│   │   ├── routes/    # API route handlers
│   │   ├── utils/     # Helper functions
│   │   └── server.ts  # Main server entry
│   └── package.json
├── sdk/               # TypeScript SDK
│   ├── src/
│   │   ├── core/      # Core analytics functionality
│   │   ├── react/     # React-specific exports
│   │   └── index.ts   # Main SDK entry
│   └── package.json
├── example/           # Example React app
└── dev.sh            # Development script
```

### Development Workflow

1. **Start Development Environment**
   ```bash
   ./dev.sh
   ```

2. **Make Changes**
   - Backend changes auto-restart the server
   - SDK changes auto-rebuild and update example app
   - Example app has hot-reload enabled

3. **Test Changes**
   - Visit http://localhost:3000 for the example app
   - Check http://localhost:8000/health for backend status
   - Monitor console for SDK debug logs

### Environment Variables

See `.env.example` for all available environment variables.

**Backend:**
- `DATABASE_URL`: PostgreSQL or SQLite connection string
- `DEFAULT_API_KEY`: Default API key for development
- `PORT`: Server port (default: 8000)
- `NODE_ENV`: Environment (development/production)

**Example App:**
- `VITE_ANALYTICS_API_KEY`: Analytics API key
- `VITE_ANALYTICS_PROJECT_ID`: Project identifier
- `VITE_ANALYTICS_ENDPOINT`: API endpoint URL

## Deployment

### Backend Deployment

1. **Environment Setup**
   ```bash
   export DATABASE_URL="postgresql://user:pass@host:5432/analytics"
   export DEFAULT_API_KEY="your-production-key"
   export NODE_ENV="production"
   ```

2. **Build and Start**
   ```bash
   cd backend
   pnpm build
   pnpm db:migrate
   pnpm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY backend/ .
RUN pnpm build
EXPOSE 8000
CMD ["pnpm", "start"]
```

### Vercel/Netlify Edge Functions

The HONO backend is compatible with edge runtime environments:

```typescript
// api/analytics.ts
import { app } from '../backend/src/server'

export default app
```

## Privacy & GDPR

- **User Consent**: SDK respects `ignoreAnalytics` flag
- **Data Minimization**: Only collect necessary analytics data
- **User Control**: Users can request data deletion via API
- **No Cookies**: Uses localStorage with cookie fallback
- **IP Anonymization**: Consider implementing IP hashing

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT - see [LICENSE](./LICENSE) for details.
