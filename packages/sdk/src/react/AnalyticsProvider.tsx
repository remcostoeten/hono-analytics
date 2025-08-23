import { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
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
} | null

const AnalyticsContext = createContext<TAnalyticsContext>(null)

export function AnalyticsProvider({
  children,
  apiKey,
  projectId,
  endpoint,
  ignoreAnalytics,
  debug
}: TProps) {
  const instanceRef = useRef<TAnalyticsInstance | null>(null)

  useEffect(() => {
    const options: TAnalyticsOptions = {
      apiKey,
      projectId,
      endpoint,
      ignoreAnalytics,
      debug
    }

    instanceRef.current = createAnalyticsInstance(options)

    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy()
        instanceRef.current = null
      }
    }
  }, [apiKey, projectId, endpoint, ignoreAnalytics, debug])

  const contextValue: TAnalyticsContext = instanceRef.current ? {
    track: instanceRef.current.track,
    identify: instanceRef.current.identify,
    getSessionId: instanceRef.current.getSessionId,
    getUserId: instanceRef.current.getUserId
  } : null

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  
  return context
}
