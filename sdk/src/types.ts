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

export type TSessionData = {
  id?: string
  referrer?: string
  origin?: string
}

export type TPageviewData = {
  url: string
  timestamp?: string
  durationMs?: number
}

export type TEventPayload = {
  user: TUserData
  session: TSessionData
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

export type TUtmParams = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

export type TAnalyticsInstance = {
  track: (data?: Partial<TPageviewData>) => Promise<void>
  identify: (userData: Partial<TUserData>) => void
  getSessionId: () => string | null
  getUserId: () => string | null
  destroy: () => void
}
