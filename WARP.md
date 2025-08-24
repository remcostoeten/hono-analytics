# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Hono Analytics** is a self-hosted, privacy-focused analytics monorepo with edge-ready TypeScript backend and client SDKs.

### Architecture Flow
```
SDK (React/Vanilla) → Hono API (Edge-Compatible) → PostgreSQL/SQLite
```

### Monorepo Structure
- `packages/backend/` - Hono API server with Drizzle ORM
- `packages/sdk/` - TypeScript client SDK with React provider
- `apps/example/` - Demo React app showcasing SDK integration
- `apps/docs/` - Fumadocs-based documentation site

## Common Development Commands

### Quick Start
```bash
./dev.sh  # Runs everything: DB setup, migrations, backend, SDK watch, example app
```

### Root Commands
```bash
pnpm dev          # Runs ./dev.sh
pnpm build        # Build all packages
pnpm type-check   # Type-check all packages
pnpm clean        # Clean all build outputs
```

### Backend Commands
```bash
pnpm --filter @hono-analytics/backend dev         # Start dev server (tsx --watch)
pnpm --filter @hono-analytics/backend build       # Compile TypeScript
pnpm --filter @hono-analytics/backend db:generate # Generate Drizzle migrations
pnpm --filter @hono-analytics/backend db:migrate  # Apply migrations
pnpm --filter @hono-analytics/backend db:setup    # Generate + migrate
```

### SDK Commands
```bash
pnpm --filter @hono-analytics/sdk dev    # Vite build watch mode
pnpm --filter @hono-analytics/sdk build  # Build CJS/ESM bundles + types
```

### Example App Commands
```bash
pnpm --filter @hono-analytics/example dev  # Start on port 3000
```

## Development Workflow

The `dev.sh` script orchestrates the entire development environment:

1. **Docker Check**: Attempts to start PostgreSQL container
2. **Database Fallback**: Falls back to SQLite if Docker unavailable
3. **Environment Setup**: Sets `NODE_ENV=development`, `PORT=8000`, `DEFAULT_API_KEY=dev-key-12345`
4. **Database Migrations**: Runs `db:generate` and `db:migrate`
5. **Parallel Services**: Starts backend, SDK watch, and example app concurrently

### Override Database
```bash
DATABASE_URL="sqlite:./backend/analytics.db" ./dev.sh  # Force SQLite
DATABASE_URL="postgresql://..." ./dev.sh                # Custom Postgres
```

## Database Setup

### PostgreSQL (Production)
```bash
export DATABASE_URL="postgresql://user:pass@host:5432/analytics"
cd packages/backend
pnpm db:generate  # Creates migrations in ./migrations
pnpm db:migrate   # Applies migrations via tsx src/db/migrate.ts
```

### SQLite (Development)
```bash
export DATABASE_URL="sqlite:./backend/analytics.db"
# Same commands as above
```

**Note**: CI tests both database engines on every PR.

## Deployment

### Fly.io (Recommended)
```bash
cd packages/backend
flyctl launch                           # Initial setup
flyctl secrets set DATABASE_URL="..."   # Set Postgres connection
flyctl secrets set DEFAULT_API_KEY="..." 
flyctl deploy --local-only              # Deploy
```
Migrations run automatically via `release_command` in `fly.toml`.

### Vercel Edge Functions
```bash
vercel --prod  # From packages/backend
```
Set environment variables in Vercel dashboard.

### Docker
```bash
docker build -t hono-analytics .
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql://..." \
  -e DEFAULT_API_KEY="prod-key" \
  hono-analytics
```

## Environment Variables

### Backend (Required)
- `DATABASE_URL` - PostgreSQL or SQLite connection string
- `DEFAULT_API_KEY` - API key for initial project seeding

### Backend (Optional)
- `NODE_ENV` - `development` | `production` (default: development)
- `PORT` - Server port (default: 8000)
- `LOG_LEVEL` - Logging verbosity (default: info)
- `CORS_ORIGIN` - Comma-separated allowed origins

### Example App
- `VITE_ANALYTICS_API_KEY` - Analytics API key (default: dev-key-12345)
- `VITE_ANALYTICS_PROJECT_ID` - Project identifier (default: default-project)  
- `VITE_ANALYTICS_ENDPOINT` - API URL (default: http://localhost:8000)

## Key Architectural Decisions

- **Hono Framework**: Edge-compatible, lightweight alternative to Express
- **Drizzle ORM**: Type-safe database abstraction supporting multiple engines
- **User-Centric Model**: Tracks users → sessions → pageviews (not just events)
- **Session Management**: 30-minute inactivity timeout with automatic renewal
- **Developer Traffic Filtering**: Automatic localhost detection, `x-dev-traffic` header support
- **Edge Deployment Ready**: Compatible with Vercel Edge, Cloudflare Workers, Deno Deploy
- **TypeScript Strict Mode**: Full type safety across monorepo

## Code Style Rules

Per user-defined rules in this repository:
- **Named exports only** (except pages/views)
- **No classes, `new`, or `this`** - functional style only
- **Function declarations only** - no arrow function constants
- **Type declarations with `T` prefix** - use `type`, never `interface`
- **No comments** - code must be self-explanatory
- **Pure functions** - no side effects outside scope
- **Immutable patterns** - spread operators, no mutations

## Testing & CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on push/PR to main/master/develop:

1. **Backend Tests**: Type-check, build, test migrations on both PostgreSQL and SQLite
2. **SDK Tests**: Type-check, build, verify output files exist
3. **Example Tests**: Build with SDK dependency
4. **Code Quality**: TypeScript checks across all packages
5. **Security Audit**: `pnpm audit --audit-level high`

### Run Tests Locally
```bash
pnpm type-check           # Type-check all packages
pnpm --filter backend tsc --noEmit  # Check specific package
```

## API Endpoints

- `GET /` - Health check / API info
- `GET /health` - Service health status
- `POST /track` - Receive analytics events (requires `x-api-key` header)
- `GET /metrics` - Retrieve aggregated data (requires `x-api-key` header)

## Database Schema

Uses Drizzle ORM with these core tables:
- `projects` - API keys and project metadata
- `users` - User profiles with device/location data
- `sessions` - User sessions with referrer tracking
- `pageviews` - Individual page visits with duration

Schema definitions: `packages/backend/src/db/schema.ts` (PostgreSQL) and `schema-sqlite.ts` (SQLite)

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format matches your database type
- For PostgreSQL: Include `?sslmode=require` for cloud databases
- For SQLite: Use relative path from backend directory

### CORS Errors
- Update allowed origins in `packages/backend/src/server.ts`
- Or set `CORS_ORIGIN` environment variable for production

### Build Failures
- Ensure `pnpm install` completed successfully
- Check Node.js version >= 18
- Clear build artifacts: `pnpm clean`

## Performance Notes

- SDK uses `requestIdleCallback` for non-blocking tracking
- Automatic batching of events when offline
- Session data persisted in localStorage with cookie fallback
- Backend supports connection pooling for PostgreSQL
