'use client'

  import { useEffect, Suspense } from 'react'
import { AnalyticsProvider as SDKAnalyticsProvider, useAnalytics } from '@hono-analytics/sdk/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { getAnalyticsConfig, isAnalyticsEnabled, getCurrentEnvironment } from '@/lib/analytics'

type TProps = {
  children: React.ReactNode
}

function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const analytics = useAnalytics()

  useEffect(() => {
    if (!analytics) return

    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    
    analytics.track({
      url,
      durationMs: 0
    })
  }, [pathname, searchParams, analytics])

  return null
}

function InteractionTracker() {
  const analytics = useAnalytics()

  useEffect(() => {
    if (!analytics || typeof window === 'undefined') return

    // Track code copy events
    function handleCopyCode(event: Event) {
      const target = event.target as HTMLElement
      if (target.closest('pre') || target.closest('[data-copy]')) {
        analytics.track({
          url: '/interaction/code-copy',
          durationMs: 0
        })
      }
    }

    // Track search interactions
    function handleSearch() {
      analytics.track({
        url: '/interaction/search',
        durationMs: 0
      })
    }

    // Track interactive component usage
    function handleInteractiveComponent(event: Event) {
      const target = event.target as HTMLElement
      const component = target.closest('[data-component]')
      if (component) {
        const componentName = component.getAttribute('data-component')
        analytics.track({
          url: `/interaction/component/${componentName}`,
          durationMs: 0
        })
      }
    }

    // Add event listeners
    document.addEventListener('click', handleCopyCode)
    document.addEventListener('click', handleInteractiveComponent)
    document.addEventListener('input', (e) => {
      const target = e.target as HTMLElement
      if (target.closest('[role=\"searchbox\"]')) {
        handleSearch()
      }
    })

    return () => {
      document.removeEventListener('click', handleCopyCode)
      document.removeEventListener('click', handleInteractiveComponent)
      document.removeEventListener('input', handleSearch)
    }
  }, [analytics])

  return null
}

export function DocsAnalyticsProvider({ children }: TProps) {
  if (!isAnalyticsEnabled()) {
    return <>{children}</>
  }

  const config = getAnalyticsConfig()
  const currentEnv = getCurrentEnvironment()

  return (
    <SDKAnalyticsProvider
      apiKey={config.apiKey}
      projectId={config.projectId}
      endpoint={config.endpoint}
      debug={currentEnv === 'development'}
    >
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <Suspense fallback={null}>
        <InteractionTracker />
      </Suspense>
      {children}
    </SDKAnalyticsProvider>
  )
}
