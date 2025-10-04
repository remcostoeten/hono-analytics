import { useState, useEffect, useCallback, useRef } from 'react'
import { useDashboardConfig } from './config/dashboard-config-context'
import { metricsCache } from './utils/request-cache'
import type { TMetricsResponse, TDateRange, THookResponse } from './types'

type TProps = {
  dateRange?: TDateRange
  pollingInterval?: number
  maxRetries?: number
  enableCache?: boolean
  cacheTTL?: number
}

function formatDateForAPI(date: Date): string {
  return date.toISOString()
}

function validateDateRange(dateRange?: TDateRange): void {
  if (!dateRange) return
  
  if (dateRange.from >= dateRange.to) {
    throw new Error('Invalid date range: "from" must be before "to"')
  }
}

function calculateBackoff(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 30000)
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

async function fetchMetricsWithCache(
  endpoint: string,
  apiKey: string,
  dateRange: TDateRange | undefined,
  enableCache: boolean,
  cacheTTL: number
): Promise<TMetricsResponse> {
  if (!enableCache) {
    return fetchMetrics(endpoint, apiKey, dateRange)
  }

  const params: Record<string, string> = {}
  if (dateRange) {
    params.start_date = formatDateForAPI(dateRange.from)
    params.end_date = formatDateForAPI(dateRange.to)
  }

  const cacheKey = metricsCache.generateKey(endpoint, apiKey, params)
  
  return metricsCache.get(
    cacheKey,
    () => fetchMetrics(endpoint, apiKey, dateRange),
    cacheTTL
  )
}

export function useAnalytics({ 
  dateRange, 
  pollingInterval, 
  maxRetries = 3,
  enableCache = true,
  cacheTTL = 5000
}: TProps = {}): THookResponse<TMetricsResponse> {
  const config = useDashboardConfig()

  if (!config) {
    throw new Error('useAnalytics must be used within DashboardAnalyticsProvider')
  }

  // Validate date range on mount and when it changes
  useEffect(function validateDates() {
    try {
      validateDateRange(dateRange)
    } catch (err) {
      throw err
    }
  }, [dateRange])

  const [data, setData] = useState<TMetricsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const backoffTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = useCallback(async function fetchDataInternal(isManualRefetch = false) {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      setLoading(true)
      setError(null)

      const result = await fetchMetricsWithCache(
        config.endpoint, 
        config.apiKey, 
        dateRange,
        enableCache,
        cacheTTL
      )
      setData(result)
      retryCountRef.current = 0 // Reset retry count on success
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)

      // Implement exponential backoff for polling errors
      if (pollingInterval && !isManualRefetch && retryCountRef.current < maxRetries) {
        retryCountRef.current += 1
        const backoffDelay = calculateBackoff(retryCountRef.current)
        
        console.warn(
          `Analytics fetch failed (attempt ${retryCountRef.current}/${maxRetries}). ` +
          `Retrying in ${backoffDelay}ms...`
        )

        // Clear existing polling interval
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }

        // Schedule retry with backoff
        backoffTimeoutRef.current = setTimeout(() => {
          fetchData(false)
          
          // Resume normal polling after successful retry
          if (pollingInterval && pollingInterval > 0) {
            pollingIntervalRef.current = setInterval(() => fetchData(false), pollingInterval)
          }
        }, backoffDelay)
      } else if (retryCountRef.current >= maxRetries) {
        // Stop polling after max retries
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
        console.error(`Analytics fetch failed after ${maxRetries} attempts. Polling stopped.`)
      }
    } finally {
      setLoading(false)
    }
  }, [config.endpoint, config.apiKey, dateRange, pollingInterval, maxRetries, enableCache, cacheTTL])

  // Wrapper for manual refetch that ensures loading state
  const refetch = useCallback(async function refetchData() {
    return fetchData(true)
  }, [fetchData])

  useEffect(function setupFetchAndPolling() {
    fetchData(false)

    if (pollingInterval && pollingInterval > 0) {
      pollingIntervalRef.current = setInterval(() => fetchData(false), pollingInterval)
    }

    return function cleanup() {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      if (backoffTimeoutRef.current) {
        clearTimeout(backoffTimeoutRef.current)
      }
    }
  }, [fetchData, pollingInterval])

  return { data, loading, error, refetch }
}
