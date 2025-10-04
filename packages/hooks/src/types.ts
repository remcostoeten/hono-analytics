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
    countries: TCountry[]
    browsers: TBrowser[]
    devices: TDevice[]
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

export type TCountry = {
  country: string
  users: number
}

export type TBrowser = {
  browser: string
  users: number
}

export type TDevice = {
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

export type TConfig = TAnalyticsConfig

export type THookResponse<T> = {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}