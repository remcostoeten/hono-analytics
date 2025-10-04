import type { TEvent, TSession } from '../types'

/**
 * Calculate session duration in seconds from start and end time.
 */
export function calculateSessionDuration(session: TSession): number {
  if (!session.endTime) {
    return 0
  }
  return Math.max(0, (session.endTime - session.startTime) / 1000)
}

/**
 * Calculate average session duration from multiple sessions.
 */
export function calculateAvgSessionDuration(sessions: TSession[]): number {
  if (sessions.length === 0) return 0

  const totalDuration = sessions.reduce((sum, session) => {
    return sum + calculateSessionDuration(session)
  }, 0)

  return totalDuration / sessions.length
}

/**
 * Group events by URL and calculate average duration per page.
 */
export function calculatePageDurations(events: TEvent[]): Map<string, number> {
  const pageDurations = new Map<string, { total: number; count: number }>()

  for (const event of events) {
    if (event.duration && event.duration > 0) {
      const existing = pageDurations.get(event.url)
      
      if (existing) {
        existing.total += event.duration
        existing.count += 1
      } else {
        pageDurations.set(event.url, { total: event.duration, count: 1 })
      }
    }
  }

  const avgDurations = new Map<string, number>()
  
  for (const [url, data] of pageDurations.entries()) {
    avgDurations.set(url, data.total / data.count)
  }

  return avgDurations
}

/**
 * Calculate average duration from events.
 */
export function calculateAvgDuration(events: TEvent[]): number {
  const eventsWithDuration = events.filter(e => e.duration && e.duration > 0)
  
  if (eventsWithDuration.length === 0) return 0

  const totalDuration = eventsWithDuration.reduce((sum, event) => {
    return sum + (event.duration || 0)
  }, 0)

  return totalDuration / eventsWithDuration.length
}
