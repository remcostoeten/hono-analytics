export { useAnalytics } from './use-analytics'
export {
  useTimeseries,
  useTopPages,
  useCountries,
  useBrowsers,
  useDevices,
  useTotals
} from './use-metric-slices'

export { HonolyticsProvider, useConfig } from './config/context'

export { initStorage, getAdapter, closeStorage, local, indexdb, sqlite, postgres, turso } from './storage'

export type {
  TMetricsResponse,
  TTimeseriesDatapoint,
  TTopPage,
  TCountry,
  TBrowser,
  TDevice,
  TDateRange,
  TAnalyticsConfig,
  TConfig,
  THookResponse
} from './types'

export type {
  TEvent,
  TSession,
  TMetric,
  TAdapter,
  TEventFilter,
  TStorageConfig
} from './storage'
