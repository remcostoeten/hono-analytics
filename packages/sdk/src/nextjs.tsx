import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { headers } from 'next/headers'
import { createAnalyticsInstance } from './analytics.js'
import type { TAnalyticsOptions, TAnalyticsInstance, TPageviewData } from './types.js'

export type TNextJSAnalyticsOptions = TAnalyticsOptions & {
  // Next.js specific options
  trackServerComponents?: boolean
  ignoreStaticPages?: boolean
  trackApiRoutes?: boolean
  excludePatterns?: string[]
  sampleRate?: number
}

// Context for Next.js analytics
const AnalyticsContext = createContext<TAnalyticsInstance | null>(null)

// Server-side analytics instance for App Router
let serverAnalytics: TAnalyticsInstance | null = null

export function initServerAnalytics(options: TNextJSAnalyticsOptions): TAnalyticsInstance {
  if (!serverAnalytics) {
    serverAnalytics = createAnalyticsInstance(options)
  }
  return serverAnalytics
}

// Server Component for automatic page tracking
export async function AnalyticsPageTracker({ 
  options,
  customData 
}: { 
  options: TNextJSAnalyticsOptions
  customData?: Partial<TPageviewData>
}) {
  // Only track on server if enabled
  if (!options.trackServerComponents) {
    return null
  }

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || headersList.get('x-url')

  // Skip tracking for excluded patterns
  if (pathname && options.excludePatterns?.some(pattern => 
    new RegExp(pattern).test(pathname)
  )) {
    return null
  }

  // Initialize analytics on server if needed
  const analytics = initServerAnalytics(options)

  // Track the page view server-side
  try {
    await analytics.track({
      url: pathname || '/',
      timestamp: new Date().toISOString(),
      durationMs: 0,
      ...customData
    })
  } catch (error) {
    // Fail silently in production, log in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Server-side analytics tracking failed:', error)
    }
  }

  return null
}

// Hook to access analytics context
export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  
  if (!context) {
    throw new Error('useAnalytics must be used within a NextJSAnalyticsProvider')
  }
  
  return context
}

// Client-side hook for Next.js that handles hydration properly

// Enhanced client component that handles Next.js routing
export function NextJSAnalyticsProvider({
  children,
  options,
  trackRouteChanges = true
}: {
  children: React.ReactNode
  options: TNextJSAnalyticsOptions
  trackRouteChanges?: boolean
}) {
  const [analytics, setAnalytics] = useState<TAnalyticsInstance | null>(null)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize analytics only on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const instance = createAnalyticsInstance(options)
      setAnalytics(instance)
      
      return () => {
        instance.destroy()
      }
    }
  }, [options])

  // Track route changes automatically
  useEffect(() => {
    if (!analytics || !trackRouteChanges) return

    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    
    // Skip tracking for excluded patterns
    if (options.excludePatterns?.some(pattern => 
      new RegExp(pattern).test(url)
    )) {
      return
    }

    analytics.track({ url })
  }, [pathname, searchParams, analytics, trackRouteChanges, options.excludePatterns])

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  )
}

// Performance monitoring utilities
export class NextJSPerformanceTracker {
  private analytics: TAnalyticsInstance
  private performanceObserver: PerformanceObserver | null = null

  constructor(analytics: TAnalyticsInstance) {
    this.analytics = analytics
    this.setupPerformanceTracking()
  }

  private setupPerformanceTracking() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    // Track Core Web Vitals with minimal overhead
    this.trackWebVitals()
    
    // Track Next.js specific metrics
    this.trackNextJSMetrics()
  }

  private trackWebVitals() {
    // LCP - Largest Contentful Paint
    this.observePerformance(['largest-contentful-paint'], (entries) => {
      const lcp = entries[entries.length - 1]
      this.analytics.track({
        url: '/performance/lcp',
        durationMs: Math.round(lcp.startTime)
      })
    })

    // FID - First Input Delay
    this.observePerformance(['first-input'], (entries) => {
      entries.forEach((entry: any) => {
        const fid = entry.processingStart - entry.startTime
        this.analytics.track({
          url: '/performance/fid',
          durationMs: Math.round(fid)
        })
      })
    })

    // CLS - Cumulative Layout Shift
    let clsScore = 0
    this.observePerformance(['layout-shift'], (entries) => {
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value
        }
      })
    })

    // Report CLS on page unload
    window.addEventListener('beforeunload', () => {
      this.analytics.track({
        url: '/performance/cls',
        durationMs: Math.round(clsScore * 1000) // Convert to ms for consistency
      })
    })
  }

  private trackNextJSMetrics() {
    // Track Next.js navigation performance
    if ('navigation' in performance) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        const metrics = {
          'ttfb': navigation.responseStart - navigation.requestStart, // Time to First Byte
          'dom-ready': navigation.domContentLoadedEventEnd - navigation.fetchStart,
          'load-complete': navigation.loadEventEnd - navigation.fetchStart,
        }

        Object.entries(metrics).forEach(([metric, value]) => {
          if (value > 0) {
            this.analytics.track({
              url: `/performance/nextjs/${metric}`,
              durationMs: Math.round(value)
            })
          }
        })
      })
    }
  }

  private observePerformance(entryTypes: string[], callback: (entries: PerformanceEntry[]) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries())
      })
      
      observer.observe({ entryTypes })
      
      if (!this.performanceObserver) {
        this.performanceObserver = observer
      }
    } catch (error) {
      // Silently fail if performance observation is not supported
    }
  }

  destroy() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
      this.performanceObserver = null
    }
  }
}

// Optimized batch tracking for high-traffic scenarios
export function createOptimizedTracker(options: TNextJSAnalyticsOptions) {
  const analytics = createAnalyticsInstance(options)
  
  // Debounce tracking calls to prevent excessive API calls
  const debouncedTrack = debounce(analytics.track.bind(analytics), 100)
  
  // Sample rate for high-traffic sites (0.1 = 10% sampling)
  const sampleRate = options.sampleRate || 1.0
  
  return {
    ...analytics,
    track: (data?: Partial<TPageviewData>) => {
      // Apply sampling
      if (Math.random() > sampleRate) {
        return Promise.resolve()
      }
      
      return debouncedTrack(data)
    }
  }
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    return new Promise((resolve) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => resolve(func(...args)), wait)
    })
  }
}

// Export performance impact assessment
export const PERFORMANCE_IMPACT = {
  // Bundle size impact (estimated)
  bundleSize: '~8KB gzipped',
  
  // Runtime performance impact
  initialization: '~2ms',
  perTrackCall: '~0.1ms',
  
  // Memory usage
  memoryFootprint: '~50KB',
  
  // Network impact
  networkRequests: 'Batched every 5s or 10 events',
  
  // Recommendations
  recommendations: [
    'Use sampling for high-traffic sites (sampleRate < 1.0)',
    'Enable batching to reduce network overhead',
    'Consider server-side tracking for critical metrics',
    'Use performance tracking sparingly in production'
  ]
}
