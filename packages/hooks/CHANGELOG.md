# Changelog

## [2.0.0] - 2024-10-04

### BREAKING CHANGES

**🔥 Project Renamed from Hono Analytics to Onolythics**

This is a complete rebrand with breaking changes:

#### Package Name Changed
- **OLD:** `@hono-analytics/dashboard-hooks` 
- **NEW:** `@onolythics/hooks`

#### Migration Guide

**1. Update your package.json:**
```bash
# Remove old package
pnpm remove @hono-analytics/dashboard-hooks

# Install new package
pnpm add @onolythics/hooks
```

**2. Update import statements:**
```tsx
// Before
import { useAnalytics } from '@hono-analytics/dashboard-hooks'

// After  
import { useAnalytics } from '@onolythics/hooks'
```

**3. No API changes** - All hook interfaces remain identical:
- `useAnalytics()` - same props, same return type
- `useTotals()` - same props, same return type  
- `useTimeseries()` - same props, same return type
- `useTopPages()` - same props, same return type
- `useCountries()` - same props, same return type
- `useBrowsers()` - same props, same return type
- `useDevices()` - same props, same return type

### What's New

- ✅ **Renamed package** from `dashboard-hooks` to just `hooks` (more generic)
- ✅ **Rebranded project** from "Hono Analytics" to "Onolythics"  
- ✅ **Updated documentation** with new branding and import paths
- ✅ **Same high-quality hooks** - no functional changes

### Why the Rebrand?

The new "Onolythics" name better reflects the project's evolution:
- More memorable and brandable
- Creative blend of "Analytics + Hono"
- Shorter, cleaner package names
- Better positioning for public release

---

## [1.0.0] - 2024-09-XX

### Initial Release

- ✅ Complete React hooks for analytics dashboards
- ✅ TypeScript support with full type definitions  
- ✅ Real-time updates with polling intervals
- ✅ Automatic cleanup and AbortController
- ✅ Granular hooks for specific data slices
- ✅ Zero mock data - real API integration
- ✅ Error handling and loading states