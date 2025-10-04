import { useState, useEffect, useCallback, useRef } from 'react'
import { useDashboardConfig } from './config/dashboard-config-context'
import type { TMetricsResponse, TDateRange, THookResponse } from './types'

type TProps = {
  dateRange?: TDateRange
  pollingInterval?: number
}

function formatDateForAPI(date: Date): string {
  return date.toISOString()
}

async function fetchMetrics(
  endpoint: string,
  apiKey: string,
  dateRange?: TDateRange
): Promise<TMetricsResponse> {
  const url = new URL(`${endpoint}/metrics`)
  
  if (dateRange) {
    url.searchParams.set('start_date', formatDateForAPI(dateRange.from))
    url.searchParams.set('end_date', formatDateForAPI(dateRange.to))
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.statusText}`)
  }

  return response.json()
}

export function useAnalytics({ dateRange, pollingInterval }: TProps = {}): THookResponse<TMetricsResponse> {
  const config = useDashboardConfig()

  if (!config) {
    throw new Error('useAnalytics must be used within DashboardAnalyticsProvider')
  }

  const [data, setData] = useState<TMetricsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = useCallback(async function fetchDataInternal() {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      setLoading(true)
      setError(null)

      const result = await fetchMetrics(config.endpoint, config.apiKey, dateRange)
      setData(result)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }, [config.endpoint, config.apiKey, dateRange])

  useEffect(function setupFetchAndPolling() {
    fetchData()

    if (pollingInterval && pollingInterval > 0) {
      pollingIntervalRef.current = setInterval(fetchData, pollingInterval)
    }

    return function cleanup() {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [fetchData, pollingInterval])

  return { data, loading, error, refetch: fetchData }
}