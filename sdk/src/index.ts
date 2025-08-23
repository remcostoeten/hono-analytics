import { createAnalyticsInstance } from './analytics.js'
import type { TAnalyticsOptions, TAnalyticsInstance, TUserData, TPageviewData, TEventPayload } from './types.js'

let globalInstance: TAnalyticsInstance | null = null

export function initAnalytics(options: TAnalyticsOptions): TAnalyticsInstance {
  if (globalInstance) {
    globalInstance.destroy()
  }
  
  globalInstance = createAnalyticsInstance(options)
  return globalInstance
}

export function track(data?: Partial<TPageviewData>): Promise<void> {
  if (!globalInstance) {
    console.warn('Analytics not initialized. Call initAnalytics() first.')
    return Promise.resolve()
  }
  
  return globalInstance.track(data)
}

export function identify(userData: Partial<TUserData>): void {
  if (!globalInstance) {
    console.warn('Analytics not initialized. Call initAnalytics() first.')
    return
  }
  
  globalInstance.identify(userData)
}

export function getSessionId(): string | null {
  if (!globalInstance) {
    return null
  }
  
  return globalInstance.getSessionId()
}

export function getUserId(): string | null {
  if (!globalInstance) {
    return null
  }
  
  return globalInstance.getUserId()
}

export function destroy(): void {
  if (globalInstance) {
    globalInstance.destroy()
    globalInstance = null
  }
}

export type {
  TAnalyticsOptions,
  TAnalyticsInstance,
  TUserData,
  TPageviewData,
  TEventPayload
}
