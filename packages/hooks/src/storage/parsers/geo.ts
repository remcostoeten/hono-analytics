export type TGeoLookupService = {
  lookup: (ip: string) => Promise<string | null>
}

export type TGeoConfig = {
  service?: TGeoLookupService
}

/**
 * Parse IP address to country code or name.
 * 
 * For now, this is a stub that returns 'Unknown'.
 * In production, you can provide a custom GeoIP service via config.
 * 
 * Example with a custom service:
 * ```ts
 * const geoService = {
 *   async lookup(ip: string) {
 *     const res = await fetch(`https://api.geoip.com/lookup?ip=${ip}`)
 *     const data = await res.json()
 *     return data.country
 *   }
 * }
 * 
 * parseIpToCountry('1.2.3.4', { service: geoService })
 * ```
 */
export async function parseIpToCountry(
  ip: string,
  config?: TGeoConfig
): Promise<string> {
  // If custom service provided, use it
  if (config?.service) {
    try {
      const country = await config.service.lookup(ip)
      return country || 'Unknown'
    } catch (error) {
      console.error('GeoIP lookup failed:', error)
      return 'Unknown'
    }
  }

  // Default: return Unknown (no built-in GeoIP)
  // Users can integrate their own service (MaxMind, ipapi, etc.)
  return 'Unknown'
}

/**
 * Synchronous version that returns 'Unknown' immediately.
 * Useful for local/indexdb adapters where async lookups are impractical.
 */
export function parseIpToCountrySync(ip: string): string {
  // For local/indexdb, we can't do async lookups efficiently
  // Return Unknown or use a preloaded local database
  return 'Unknown'
}
