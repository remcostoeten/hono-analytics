import { useAnalytics } from '@hono-analytics/sdk/react'

export function useAnalyticsActions() {
  const analytics = useAnalytics()

  const trackCustomEvent = async () => {
    await analytics.track({
      url: '/custom-event',
      durationMs: Math.floor(Math.random() * 5000)
    })
  }

  const identifyUser = () => {
    // Generate a proper UUID for the user ID
    const userId = crypto.randomUUID()
    analytics.identify({
      id: userId,
      country: 'Netherlands',
      city: 'Amsterdam'
    })
  }

  const getUserId = () => analytics.getUserId()
  const getSessionId = () => analytics.getSessionId()

  return {
    trackCustomEvent,
    identifyUser,
    getUserId,
    getSessionId
  }
}
