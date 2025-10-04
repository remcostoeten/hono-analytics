import { useMemo } from 'react'
import { useAnalytics } from './use-analytics'
import type {
  TDateRange,
  THookResponse,
  TTimeseriesDatapoint,
  TTopPage,
  TCountry,
  TDevice,
  TBrowser,
  } from './types'

type TProps = {
  dateRange?: TDateRange
  pollingInterval?: number
}

export function useTimeseries({ dateRange, pollingInterval }: TProps = {}): THookResponse<TTimeseriesDatapoint[]> {
  const { data, loading, error, refetch } = useAnalytics({
    dateRange,
    pollingInterval
  })

  const timeseries = useMemo(function computeTimeseries() {
    return data?.timeseries || null
  }, [data])

  return { data: timeseries, loading, error, refetch }
}

export function useTopPages({ dateRange, pollingInterval }: TProps = {}): THookResponse<TTopPage[]> {
  const { data, loading, error, refetch } = useAnalytics({
    dateRange,
    pollingInterval
  })

  const topPages = useMemo(function computeTopPages() {
    return data?.breakdowns.topPages || null
  }, [data])

  return { data: topPages, loading, error, refetch }
}

export function useCountries({ dateRange, pollingInterval }: TProps = {}): THookResponse<TCountry[]> {
  const { data, loading, error, refetch } = useAnalytics({
    dateRange,
    pollingInterval
  })

  const countries = useMemo(function computeCountries() {
    return data?.breakdowns.countries || null
  }, [data])

  return { data: countries, loading, error, refetch }
}

export function useBrowsers({ dateRange, pollingInterval }: TProps = {}): THookResponse<TBrowser[]> {
  const { data, loading, error, refetch } = useAnalytics({
    dateRange,
    pollingInterval
  })

  const browsers = useMemo(function computeBrowsers() {
    return data?.breakdowns.browsers || null
  }, [data])

  return { data: browsers, loading, error, refetch }
}

export function useDevices({ dateRange, pollingInterval }: TProps = {}): THookResponse<TDevice[]> {
  const { data, loading, error, refetch } = useAnalytics({
    dateRange,
    pollingInterval
  })

  const devices = useMemo(function computeDevices() {
    return data?.breakdowns.devices || null
  }, [data])

  return { data: devices, loading, error, refetch }
}

export function useTotals({ dateRange, pollingInterval }: TProps = {}): THookResponse<{
  users: number
  sessions: number
  pageviews: number
  avgDuration: number
} | null> {
  const { data, loading, error, refetch } = useAnalytics({
    dateRange,
    pollingInterval
  })

  const totals = useMemo(function computeTotals() {
    return data?.totals || null
  }, [data])

  return { data: totals, loading, error, refetch }
}