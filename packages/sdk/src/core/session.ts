import { getSessionId, setSessionId, clearSession } from './storage.js'

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds

let sessionTimer: ReturnType<typeof setTimeout> | null = null
let lastActivityTime = Date.now()

function generateSessionId(): string {
  return crypto.randomUUID()
}

function resetSessionTimer(): void {
  if (sessionTimer) {
    clearTimeout(sessionTimer)
  }
  
  sessionTimer = setTimeout(() => {
    clearSession()
    sessionTimer = null
  }, SESSION_TIMEOUT)
}

function trackActivity(): void {
  lastActivityTime = Date.now()
  resetSessionTimer()
}

export function getCurrentSessionId(): string {
  let sessionId = getSessionId()
  
  if (!sessionId || isSessionExpired()) {
    sessionId = generateSessionId()
    setSessionId(sessionId)
  }
  
  trackActivity()
  return sessionId
}

function isSessionExpired(): boolean {
  const timeSinceActivity = Date.now() - lastActivityTime
  return timeSinceActivity > SESSION_TIMEOUT
}

export function initializeSessionTracking(): void {
  if (typeof window === 'undefined') return
  
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
  
  function handleActivity() {
    trackActivity()
  }
  
  events.forEach(event => {
    document.addEventListener(event, handleActivity, { passive: true })
  })
  
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (isSessionExpired()) {
        clearSession()
      } else {
        trackActivity()
      }
    }
  })
  
  trackActivity()
}

export function destroySessionTracking(): void {
  if (sessionTimer) {
    clearTimeout(sessionTimer)
    sessionTimer = null
  }
}
