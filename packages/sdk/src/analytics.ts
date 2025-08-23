import { getUserId, setUserId } from './core/storage.js'
import { getCurrentSessionId, initializeSessionTracking, destroySessionTracking } from './core/session.js'
import { collectDeviceInfo, extractUtmParams, getReferrer, getCurrentUrl, isLocalhost } from './core/collect.js'
import { initializeTransport, sendEvent, destroyTransport } from './core/transport.js'
import type { TAnalyticsOptions, TAnalyticsInstance, TUserData, TPageviewData, TEventPayload } from './types.js'

function createAnalyticsInstance(options: TAnalyticsOptions): TAnalyticsInstance {
  let currentUserData: Partial<TUserData> = {}
  let isDestroyed = false

  initializeTransport(options)
  initializeSessionTracking()

  const deviceInfo = collectDeviceInfo()

  async function track(data: Partial<TPageviewData> = {}): Promise<void> {
    if (isDestroyed) {
      console.warn('Analytics instance has been destroyed')
      return
    }

    const userId = getUserId()
    const sessionId = getCurrentSessionId()
    const url = data.url || getCurrentUrl()
    const referrer = getReferrer()
    const utmParams = extractUtmParams(url)

    const payload: TEventPayload = {
      user: {
        id: userId,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        ...currentUserData
      },
      session: {
        id: sessionId,
        referrer,
        origin: referrer ? new URL(referrer).hostname : 'direct'
      },
      pageview: {
        url,
        timestamp: data.timestamp || new Date().toISOString(),
        durationMs: data.durationMs
      }
    }

    await sendEvent(payload)
  }

  function identify(userData: Partial<TUserData>): void {
    if (isDestroyed) {
      console.warn('Analytics instance has been destroyed')
      return
    }

    currentUserData = { ...currentUserData, ...userData }

    if (userData.id) {
      setUserId(userData.id)
    }
  }

  function getSessionId(): string | null {
    return getCurrentSessionId()
  }

  function getUserIdValue(): string | null {
    return getUserId()
  }

  function destroy(): void {
    if (isDestroyed) return

    destroySessionTracking()
    destroyTransport()
    isDestroyed = true
  }

  if (typeof window !== 'undefined') {
    track()

    window.addEventListener('beforeunload', () => {
      destroy()
    })
  }

  return {
    track,
    identify,
    getSessionId,
    getUserId: getUserIdValue,
    destroy
  }
}

export { createAnalyticsInstance }
