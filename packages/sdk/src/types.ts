export type TAnalyticsOptions = {
  apiKey: string
  projectId: string
  endpoint?: string
  ignoreAnalytics?: boolean
  debug?: boolean
}

export type TUserData = {
  id?: string
  device?: string
  browser?: string
  os?: string
  country?: string
  city?: string
  lat?: number
  lng?: number
}

export type TPageviewData = {
  url: string
  timestamp?: string
  durationMs?: number
}

export type TEventPayload = {
  user: TUserData
  session: {
    id?: string
    referrer?: string
    origin?: string
  }
  pageview: TPageviewData
}

export type TConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown'

export type TDeviceInfo = {
  browser: string
  os: string
  device: string
  screen: {
    width: number
    height: number
  }
  language: string
  connection: TConnectionType
  userAgent: string
}


export type TAnalyticsInstance = {
  track: (data?: Partial<TPageviewData>) => Promise<void>
  identify: (userData: Partial<TUserData>) => void
  getSessionId: () => string | null
  getUserId: () => string | null
  destroy: () => void
}
