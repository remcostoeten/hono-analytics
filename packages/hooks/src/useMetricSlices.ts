import { useMemo } from 'react'
import { useAnalytics } from './useAnalytics'
import type {
  TAnalyticsConfig,
  TDateRange,
  THookResponse,
  TTimeseriesDatapoint,
  TTopPage,
  TCountryBreakdown,
  TBrowserBreakdown,
  TDeviceBreakdown
} from './types'

type TBaseProps = {
  config: TAnalyticsConfig
  dateRange?: TDateRange
  pollingInterval?: number
}

export function useTimeseries(props: TBaseProps): THookResponse<TTimeseriesDatapoint[]> {
  const { data, loading, error, refetch } = useAnalytics(props)

  const timeseries = useMemo(function computeTimeseries() {
    return data?.timeseries || null
  }, [data])

  return { data: timeseries, loading, error, refetch }
}

export function useTopPages(props: TBaseProps): THookResponse<TTopPage[]> {
  const { data, loading, error, refetch } = useAnalytics(props)

  const topPages = useMemo(function computeTopPages() {
    return data?.breakdowns.topPages || null
  }, [data])

  return { data: topPages, loading, error, refetch }
}

export function useCountries(props: TBaseProps): THookResponse<TCountryBreakdown[]> {
  const { data, loading, error, refetch } = useAnalytics(props)

  const countries = useMemo(function computeCountries() {
    return data?.breakdowns.countries || null
  }, [data])

  return { data: countries, loading, error, refetch }
}

export function useBrowsers(props: TBaseProps): THookResponse<TBrowserBreakdown[]> {
  const { data, loading, error, refetch } = useAnalytics(props)

  const browsers = useMemo(function computeBrowsers() {
    return data?.breakdowns.browsers || null
  }, [data])

  return { data: browsers, loading, error, refetch }
}

export function useDevices(props: TBaseProps): THookResponse<TDeviceBreakdown[]> {
  const { data, loading, error, refetch } = useAnalytics(props)

  const devices = useMemo(function computeDevices() {
    return data?.breakdowns.devices || null
  }, [data])

  return { data: devices, loading, error, refetch }
}

export function useTotals(props: TBaseProps): THookResponse<{
  users: number
  sessions: number
  pageviews: number
  avgDuration: number
} | null> {
  const { data, loading, error, refetch } = useAnalytics(props)

  const totals = useMemo(function computeTotals() {
    return data?.totals || null
  }, [data])

  return { data: totals, loading, error, refetch }
}
