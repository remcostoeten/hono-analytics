# HONO Analytics Backend

A real-time analytics backend built with Hono, TypeScript, and PostgreSQL.

## Quick Start

1. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and other settings
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up the database:**
   ```bash
   pnpm db:setup
   ```
   This will:
   - Generate database migrations
   - Run migrations to create tables
   - Seed a default project with API key: `dev-key-12345`
   - Add sample analytics data for development

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
All endpoints require an `x-api-key` header. The default development key is `dev-key-12345`.

### Track Analytics
```bash
POST /track
Headers: x-api-key: dev-key-12345
Body: {
  "user": {
    "country": "Netherlands",
    "city": "Amsterdam"
  },
  "session": {
    "referrer": "https://google.com"
  },
  "pageview": {
    "url": "/dashboard",
    "durationMs": 5000
  }
}
```

### Get Metrics
```bash
GET /metrics?range=7d&exclude_dev=true
Headers: x-api-key: dev-key-12345
```

Query parameters:
- `range`: Time range (7d, 30d, 90d)
- `exclude_dev`: Whether to exclude development traffic (true/false)

## Using the Real Analytics Dashboard

The analytics dashboard in the docs app now fetches real data from this backend:

1. **Start the backend server** (see Quick Start above)
2. **Start the docs app:**
   ```bash
   cd apps/docs
   pnpm dev
   ```
3. **Navigate to the analytics dashboard** - it will automatically connect to your backend

The dashboard will show:
- Real user counts, sessions, and pageviews
- Top pages with actual view counts
- Geographic breakdown by country
- Browser and device statistics
- Time series data over the selected range

## Development

- **Add sample data:** `pnpm db:seed`
- **Reset database:** `pnpm db:setup`
- **View logs:** Check console output during development

## Production Deployment

The backend is configured for deployment on Fly.io with Neon PostgreSQL. See `fly.toml` and `deploy.sh` for deployment details.
