import { createContext, useContext, ReactNode } from 'react'
import type { TDashboardConfig } from '../types'

type TProps = {
  children: ReactNode
  apiKey: string
  endpoint: string
}

const DashboardConfigContext = createContext<TDashboardConfig | null>(null)

export function DashboardAnalyticsProvider({ children, apiKey, endpoint }: TProps) {
  const config: TDashboardConfig = { apiKey, endpoint }

  return (
    <DashboardConfigContext.Provider value={config}>
      {children}
    </DashboardConfigContext.Provider>
  )
}

export function useDashboardConfig(): TDashboardConfig | null {
  return useContext(DashboardConfigContext)
}

