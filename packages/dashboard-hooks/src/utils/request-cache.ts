type TCacheEntry<T> = {
  data: T
  timestamp: number
  promise?: Promise<T>
}

type TCacheKey = string

const CACHE_TTL = 5000 // 5 seconds default TTL

export class RequestCache<T> {
  private cache = new Map<TCacheKey, TCacheEntry<T>>()
  private pendingRequests = new Map<TCacheKey, Promise<T>>()

  generateKey(endpoint: string, apiKey: string, params?: Record<string, string>): TCacheKey {
    const sortedParams = params 
      ? Object.keys(params)
          .sort()
          .map(key => `${key}=${params[key]}`)
          .join('&')
      : ''
    
    // Hash the apiKey to avoid storing it in plain text in the key
    const apiKeyHash = apiKey.substring(0, 8)
    return `${endpoint}:${apiKeyHash}:${sortedParams}`
  }

  async get(
    key: TCacheKey,
    fetcher: () => Promise<T>,
    ttl: number = CACHE_TTL
  ): Promise<T> {
    const now = Date.now()
    const cached = this.cache.get(key)

    // Return cached data if it's still fresh
    if (cached && now - cached.timestamp < ttl) {
      return cached.data
    }

    // If there's a pending request for this key, return that promise
    const pending = this.pendingRequests.get(key)
    if (pending) {
      return pending
    }

    // Otherwise, make a new request
    const promise = fetcher()
      .then(data => {
        this.cache.set(key, {
          data,
          timestamp: Date.now()
        })
        this.pendingRequests.delete(key)
        return data
      })
      .catch(error => {
        this.pendingRequests.delete(key)
        throw error
      })

    this.pendingRequests.set(key, promise)
    return promise
  }

  invalidate(key?: TCacheKey): void {
    if (key) {
      this.cache.delete(key)
      this.pendingRequests.delete(key)
    } else {
      // Clear all cache
      this.cache.clear()
      this.pendingRequests.clear()
    }
  }

  clear(): void {
    this.invalidate()
  }
}

// Singleton instance for metrics requests
export const metricsCache = new RequestCache<any>()
