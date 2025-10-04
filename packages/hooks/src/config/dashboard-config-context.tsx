import { createContext, useContext, ReactNode } from 'react'
import type { TConfig } from '../types'

type TProps = {
  children: ReactNode
  apiKey: string
  endpoint: string
}

const ConfigContext = createContext<TConfig | null>(null)

export function OnolythicsProvider({ children, apiKey, endpoint }: TProps) {
  const config: TConfig = { apiKey, endpoint }

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig(): TConfig | null {
  return useContext(ConfigContext)
}

