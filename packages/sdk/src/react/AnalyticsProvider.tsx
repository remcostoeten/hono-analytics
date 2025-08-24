import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { createAnalyticsInstance } from '../analytics.js'
import type { TAnalyticsOptions, TAnalyticsInstance, TUserData, TPageviewData } from '../types.js'

type TProps = {
  children: ReactNode
  apiKey: string
  projectId: string
  endpoint?: string
  ignoreAnalytics?: boolean
  debug?: boolean
}

type TAnalyticsContext = {
  track: (data?: Partial<TPageviewData>) => Promise<void>
  identify: (userData: Partial<TUserData>) => void
  getSessionId: () => string | null
  getUserId: () => string | null
}

// Create default context with no-op functions
const defaultContext: TAnalyticsContext = {
  track: async () => {},
  identify: () => {},
  getSessionId: () => null,
  getUserId: () => null
}

const AnalyticsContext = createContext<TAnalyticsContext>(defaultContext)

export function AnalyticsProvider({
  children,
  apiKey,
  projectId,
  endpoint,
  ignoreAnalytics,
  debug
}: TProps) {
  const [instance, setInstance] = useState<TAnalyticsInstance | null>(null)
  const optionsRef = useRef<TAnalyticsOptions | null>(null)

  useEffect(() => {
    const options: TAnalyticsOptions = {
      apiKey,
      projectId,
      endpoint,
      ignoreAnalytics,
      debug
    }

    // Only create/recreate if options changed or instance doesn't exist
    if (!instance || JSON.stringify(optionsRef.current) !== JSON.stringify(options)) {
      if (instance) {
        instance.destroy()
      }
      
      const newInstance = createAnalyticsInstance(options)
      setInstance(newInstance)
      optionsRef.current = options
    }

    return () => {
      if (instance) {
        instance.destroy()
        setInstance(null)
      }
    }
  }, [apiKey, projectId, endpoint, ignoreAnalytics, debug])

  const contextValue: TAnalyticsContext = instance ? {
    track: instance.track,
    identify: instance.identify,
    getSessionId: instance.getSessionId,
    getUserId: instance.getUserId
  } : defaultContext

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)

  // Since we always provide a default context, this should never be null
  // But keeping the check for safety
  if (!context) {
    console.warn('useAnalytics was called outside of an AnalyticsProvider. Using default no-op implementation.')
    return defaultContext
  }

  return context
}
