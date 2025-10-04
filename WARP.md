# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Honolytics is a lightweight, privacy-first analytics solution built as a monorepo. It provides React hooks for building analytics dashboards with a Hono.js backend. The project emphasizes self-hosting, storage flexibility, and minimal dependencies.

**Key Architectural Principle**: Storage-agnostic design - bring your own backend OR use client-side storage adapters.

**Current Status**: The hooks package is feature-complete with advanced caching, polling, and error handling. However, the backend API and tracking SDK are NOT implemented yet (see STATUS.md for implementation roadmap).

## Commands

### Development

```bash
# Install dependencies
bun install

# Run documentation site in dev mode
bun run dev

# Build hooks package only
bun run build

# Build all packages (hooks + docs)
bun run build:all

# Type check hooks package
cd packages/hooks && bun run typecheck

# Watch mode for hooks development
cd packages/hooks && bun run dev
```

### Package Management

**Always use bun** - fallback to pnpm only if bun fails. Never use npm or yarn.

## Architecture

### Monorepo Structure

```
honolytics/
├── apps/
│   └── docs/              # Fumadocs documentation (Next.js 15 + React 19)
└── packages/
    └── hooks/             # React hooks for analytics dashboards
        ├── src/
        │   ├── use-analytics.ts          # Main hook with full metrics
        │   ├── use-metric-slices.ts      # Specialized hooks (totals, timeseries, etc.)
        │   ├── config/context.tsx        # HonolyticsProvider context
        │   ├── utils/request-cache.ts    # Request caching & deduplication
        │   ├── storage/                  # Storage adapter system
        │   │   ├── adapters/             # Local, IndexDB, SQLite, Postgres, Turso
        │   │   ├── types.ts              # Storage type definitions
        │   │   ├── factory.ts            # Adapter creation
        │   │   └── parsers/              # User-agent & geo parsing
        │   └── types.ts                  # Core hook types
        └── dist/                         # Compiled output
```

### Hooks Package Design

The `honolytics` package provides a **centralized configuration** pattern for analytics dashboards:

1. **Provider Pattern**: `HonolyticsProvider` sets API config once at app root
2. **Specialized Hooks**: Individual hooks for different data slices (totals, timeseries, breakdowns)
3. **Advanced Features**:
   - In-memory request caching with TTL (default 5s)
   - Request deduplication (prevents duplicate API calls)
   - Exponential backoff retry logic (up to 3 retries)
   - Polling support with configurable intervals
   - AbortController for proper cleanup

**Critical Pattern**: All hooks expect an external API endpoint (`/metrics`) that returns aggregated analytics data. The hooks DO NOT track events - they only read metrics.

### Storage Adapter System

Located in `packages/hooks/src/storage/`, the adapter system provides a unified interface (`TAdapter`) for multiple storage backends:

- **`local.ts`**: ✅ Fully implemented localStorage adapter
- **`indexdb.ts`**: ⚠️ Stub implementation (throws "not implemented")
- **`sqlite.ts`**: ⚠️ Stub (requires better-sqlite3)
- **`postgres.ts`**: ⚠️ Partial implementation needs testing
- **`turso.ts`**: ⚠️ Partial implementation needs testing

**Important**: The intended use of these adapters is unclear. They're exported from a client-side package but include server-side database logic (SQLite, Postgres). See STATUS.md for architectural questions.

### Type System

**Follows strict naming conventions**:
- All types prefixed with `T` (e.g., `TMetricsResponse`, `TAdapter`)
- Uses `type` aliases, never `interface`
- No default exports except in pages/views

**Core Types**:
- `TMetricsResponse`: Full analytics data structure (totals + timeseries + breakdowns)
- `TAdapter`: Storage backend interface
- `THookResponse<T>`: Standard hook return type with data, loading, error, refetch

### Request Caching Implementation

`utils/request-cache.ts` implements a sophisticated caching layer:

```typescript
// Singleton cache instance
metricsCache.get(cacheKey, fetcher, ttl)

// Key generation includes: endpoint + apiKey hash + sorted params
// Prevents duplicate in-flight requests via pendingRequests map
```

**Cache Strategy**:
1. Check cache freshness (timestamp < TTL)
2. If cached and fresh, return immediately
3. If request in-flight, return existing promise (deduplication)
4. Otherwise, make new request and cache result

## Development Guidelines

### Working with Hooks

When modifying or creating hooks:
1. Always extend from the base `THookResponse<T>` type
2. Use `useConfig()` to access centralized config (apiKey, endpoint)
3. Implement proper cleanup with `useEffect` return functions
4. Use `useCallback` for memoized fetch functions
5. Always handle AbortController for request cancellation

**Example Hook Pattern**:
```typescript
export function useCustomMetric(): THookResponse<TCustomData> {
  const config = useConfig()
  const [data, setData] = useState<TCustomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    // ... fetch logic
  }, [config])

  useEffect(() => {
    fetchData()
    return () => abortControllerRef.current?.abort()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
```

### Storage Adapters

**Current State**: Only `local.ts` is production-ready. Others need implementation or architectural clarification.

If implementing a new adapter:
1. Implement the full `TAdapter` interface (see `storage/types.ts`)
2. Handle all query methods: metrics, totals, topPages, countries, browsers, devices
3. Add user-agent parsing via `parsers/user-agent.ts`
4. Add geo-IP parsing via `parsers/geo.ts`
5. Export via `storage/factory.ts`

### Documentation Site

The `apps/docs/` directory uses Fumadocs with Next.js 15:
- Content lives in `content/docs/`
- Configuration in `source.ts`
- MDX is pre-processed via `postinstall` hook

## Known Limitations

1. **No Backend**: Hooks expect a `/metrics` API endpoint that doesn't exist yet
2. **No Tracking SDK**: No way to track events and send data to backend
3. **Incomplete Storage**: 4 out of 5 storage adapters are stubs
4. **No Example App**: No working demo showing integration

See STATUS.md for full implementation roadmap and architectural decisions needed.

## References

- **STATUS.md**: Detailed project status, gaps, and implementation roadmap
- **README.md**: User-facing quick start and hook usage examples
- **packages/hooks/README.md**: Hook-specific documentation
