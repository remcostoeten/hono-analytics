import type { TEventPayload, TAnalyticsOptions } from '../types.js'

let eventQueue: TEventPayload[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null
let options: TAnalyticsOptions | null = null

const BATCH_SIZE = 10
const BATCH_TIMEOUT = 5000
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

export function initializeTransport(analyticsOptions: TAnalyticsOptions): void {
  options = analyticsOptions
}

export async function sendEvent(payload: TEventPayload): Promise<void> {
  if (!options) {
    console.warn('Analytics transport not initialized')
    return
  }

  if (options.ignoreAnalytics || options.debug) {
    if (options.debug) {
      console.log('Analytics Debug:', payload)
    }
    if (options.ignoreAnalytics) {
      return
    }
  }

  eventQueue.push(payload)

  if (eventQueue.length >= BATCH_SIZE) {
    await flushEvents()
  } else {
    scheduleFlush()
  }
}

function scheduleFlush(): void {
  if (flushTimer) return

  flushTimer = setTimeout(async () => {
    await flushEvents()
  }, BATCH_TIMEOUT)
}

async function flushEvents(): Promise<void> {
  if (!options || eventQueue.length === 0) return

  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }

  const eventsToSend = [...eventQueue]
  eventQueue = []

  for (const event of eventsToSend) {
    await sendEventWithRetry(event)
  }
}

async function sendEventWithRetry(payload: TEventPayload, retryCount = 0): Promise<void> {
  if (!options) return

  try {
    const endpoint = options.endpoint || 'http://localhost:8000'
    const url = `${endpoint}/track`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': options.apiKey,
        'x-dev-traffic': String(payload.user.id?.includes('dev') || false)
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount)
      
      setTimeout(() => {
        sendEventWithRetry(payload, retryCount + 1)
      }, delay)
    } else {
      console.error('Analytics tracking failed after retries:', error)
    }
  }
}

export function destroyTransport(): void {
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
  
  if (eventQueue.length > 0) {
    flushEvents()
  }
  
  eventQueue = []
  options = null
}
