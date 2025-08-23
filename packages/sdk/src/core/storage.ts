const STORAGE_KEYS = {
  USER_ID: 'hono_analytics_user_id',
  SESSION_ID: 'hono_analytics_session_id'
} as const

function generateId(): string {
  return crypto.randomUUID()
}

function isLocalStorageAvailable(): boolean {
  try {
    const test = '__test_localStorage__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

function setCookie(name: string, value: string, days: number = 365): void {
  const expires = new Date()
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

function getCookie(name: string): string | null {
  const nameEQ = name + '='
  const cookies = document.cookie.split(';')
  
  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length)
    }
  }
  
  return null
}

export function getUserId(): string {
  if (isLocalStorageAvailable()) {
    let userId = localStorage.getItem(STORAGE_KEYS.USER_ID)
    if (userId) return userId
  }
  
  let userId = getCookie(STORAGE_KEYS.USER_ID)
  if (userId) return userId
  
  userId = generateId()
  setUserId(userId)
  return userId
}

export function setUserId(userId: string): void {
  if (isLocalStorageAvailable()) {
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId)
  }
  
  setCookie(STORAGE_KEYS.USER_ID, userId)
}

export function getSessionId(): string | null {
  if (isLocalStorageAvailable()) {
    return localStorage.getItem(STORAGE_KEYS.SESSION_ID)
  }
  
  return getCookie(STORAGE_KEYS.SESSION_ID)
}

export function setSessionId(sessionId: string): void {
  if (isLocalStorageAvailable()) {
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId)
  }
  
  setCookie(STORAGE_KEYS.SESSION_ID, sessionId, 1)
}

export function clearSession(): void {
  if (isLocalStorageAvailable()) {
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID)
  }
  
  setCookie(STORAGE_KEYS.SESSION_ID, '', -1)
}

export function clearAll(): void {
  if (isLocalStorageAvailable()) {
    localStorage.removeItem(STORAGE_KEYS.USER_ID)
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID)
  }
  
  setCookie(STORAGE_KEYS.USER_ID, '', -1)
  setCookie(STORAGE_KEYS.SESSION_ID, '', -1)
}
