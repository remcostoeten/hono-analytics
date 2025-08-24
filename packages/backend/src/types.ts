// Database model types are defined inline where needed

export type TMetricsResponse = {
  totals: {
    users: number
    sessions: number
    pageviews: number
    avgDuration: number
  }
  timeseries: Array<{
    date: string
    users: number
    sessions: number
    pageviews: number
  }>
  breakdowns: {
    topPages: Array<{
      url: string
      views: number
      avgDuration: number
    }>
    countries: Array<{
      country: string
      users: number
    }>
    browsers: Array<{
      browser: string
      users: number
    }>
    devices: Array<{
      device: string
      users: number
    }>
  }
}


