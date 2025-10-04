export type TMetricsResponse = {
  totals: {
    users: number
    sessions: number
    pageviews: number
    avgDuration: number
  }
  timeseries: TTimeseriesDatapoint[]
  breakdowns: {
    topPages: TTopPage[]
    countries: TCountryBreakdown[]
    browsers: TBrowserBreakdown[]
    devices: TDeviceBreakdown[]
  }
}

export type TTimeseriesDatapoint = {
  date: string
  users: number
  sessions: number
  pageviews: number
}

export type TTopPage = {
  url: string
  views: number
  avgDuration: number
}

export type TCountryBreakdown = {
  country: string
  users: number
}

export type TBrowserBreakdown = {
  browser: string
  users: number
}

export type TDeviceBreakdown = {
  device: string
  users: number
}

export type TDateRange = {
  from: Date
  to: Date
}

export type TAnalyticsConfig = {
  apiKey: string
  endpoint: string
}

export type THookResponse<T> = {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}
