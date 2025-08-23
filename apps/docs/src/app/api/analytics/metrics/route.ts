import { NextRequest, NextResponse } from 'next/server'
import { getAnalyticsConfig, type TAnalyticsEnvironment } from '@/lib/analytics'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const environment = (searchParams.get('environment') || 'development') as TAnalyticsEnvironment
  const range = searchParams.get('range') || '7d'

  try {
    if (environment === 'combined') {
      // For combined view, fetch from both development and production
      const [devData, prodData] = await Promise.allSettled([
        fetchEnvironmentMetrics('development', range),
        fetchEnvironmentMetrics('production', range)
      ])

      const devMetrics = devData.status === 'fulfilled' ? devData.value : null
      const prodMetrics = prodData.status === 'fulfilled' ? prodData.value : null

      // Combine the metrics
      const combinedMetrics = combineMetrics(devMetrics, prodMetrics)
      
      return NextResponse.json(combinedMetrics)
    } else {
      // Fetch single environment metrics
      const metrics = await fetchEnvironmentMetrics(environment, range)
      return NextResponse.json(metrics)
    }
  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

async function fetchEnvironmentMetrics(environment: TAnalyticsEnvironment, range: string) {
  const config = getAnalyticsConfig(environment)
  
  if (!config.enabled || !config.endpoint) {
    throw new Error(`${environment} environment not configured`)
  }

  const url = `${config.endpoint}/metrics?range=${range}`
  const headers = {
    'x-api-key': config.apiKey,
    'Content-Type': 'application/json'
  }

  const response = await fetch(url, {
    headers,
    // Add timeout for development environment that might not be running
    signal: AbortSignal.timeout(environment === 'development' ? 3000 : 10000)
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

function combineMetrics(devMetrics: any, prodMetrics: any) {
  // If neither environment has data, return empty structure
  if (!devMetrics && !prodMetrics) {
    return {
      totals: {
        users: 0,
        sessions: 0,
        pageviews: 0,
        avgDuration: 0
      },
      timeseries: [],
      breakdowns: {
        topPages: [],
        countries: [],
        browsers: [],
        devices: []
      },
      environments: {
        development: { available: false },
        production: { available: false }
      }
    }
  }

  // Helper function to safely add numbers
  const safeAdd = (a: number = 0, b: number = 0) => a + b

  // Combine totals
  const totals = {
    users: safeAdd(devMetrics?.totals?.users, prodMetrics?.totals?.users),
    sessions: safeAdd(devMetrics?.totals?.sessions, prodMetrics?.totals?.sessions),
    pageviews: safeAdd(devMetrics?.totals?.pageviews, prodMetrics?.totals?.pageviews),
    avgDuration: Math.round((
      (devMetrics?.totals?.avgDuration || 0) + 
      (prodMetrics?.totals?.avgDuration || 0)
    ) / 2)
  }

  // Combine and deduplicate timeseries data
  const combinedTimeseries = new Map()
  
  ;[devMetrics?.timeseries || [], prodMetrics?.timeseries || []].flat().forEach(item => {
    const date = item.date
    if (!combinedTimeseries.has(date)) {
      combinedTimeseries.set(date, { date, users: 0, sessions: 0, pageviews: 0 })
    }
    const existing = combinedTimeseries.get(date)
    existing.users += item.users || 0
    existing.sessions += item.sessions || 0
    existing.pageviews += item.pageviews || 0
  })

  // Combine breakdown data
  const breakdowns = {
    topPages: combineAndSortBreakdown(
      devMetrics?.breakdowns?.topPages || [],
      prodMetrics?.breakdowns?.topPages || [],
      'views'
    ),
    countries: combineAndSortBreakdown(
      devMetrics?.breakdowns?.countries || [],
      prodMetrics?.breakdowns?.countries || [],
      'users'
    ),
    browsers: combineAndSortBreakdown(
      devMetrics?.breakdowns?.browsers || [],
      prodMetrics?.breakdowns?.browsers || [],
      'users'
    ),
    devices: combineAndSortBreakdown(
      devMetrics?.breakdowns?.devices || [],
      prodMetrics?.breakdowns?.devices || [],
      'users'
    )
  }

  return {
    totals,
    timeseries: Array.from(combinedTimeseries.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ),
    breakdowns,
    environments: {
      development: { available: Boolean(devMetrics) },
      production: { available: Boolean(prodMetrics) }
    }
  }
}

function combineAndSortBreakdown(devData: any[], prodData: any[], valueKey: string) {
  const combined = new Map()

  ;[devData, prodData].flat().forEach(item => {
    if (!item) return
    
    const key = item.url || item.country || item.browser || item.device
    if (!combined.has(key)) {
      combined.set(key, { ...item, [valueKey]: 0 })
    }
    const existing = combined.get(key)
    existing[valueKey] += item[valueKey] || 0
    
    // For pages, also combine avgDuration
    if (item.avgDuration) {
      existing.avgDuration = Math.round(
        ((existing.avgDuration || 0) + (item.avgDuration || 0)) / 2
      )
    }
  })

  return Array.from(combined.values())
    .sort((a, b) => (b[valueKey] || 0) - (a[valueKey] || 0))
    .slice(0, 10) // Limit to top 10
}
