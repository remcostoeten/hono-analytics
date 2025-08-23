import { UAParser } from 'ua-parser-js'

export function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent)
  const result = parser.getResult()
  
  return {
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
    device: getDeviceType(result.device.type)
  }
}

function getDeviceType(type?: string): string {
  if (!type) return 'desktop'
  
  switch (type.toLowerCase()) {
    case 'mobile':
      return 'mobile'
    case 'tablet':
      return 'tablet'
    default:
      return 'desktop'
  }
}

export function isDevTraffic(host?: string, devHeader?: string): boolean {
  if (devHeader === 'true') return true
  
  if (host) {
    const hostLower = host.toLowerCase()
    return hostLower.includes('localhost') || 
           hostLower.includes('127.0.0.1') || 
           hostLower.includes('0.0.0.0')
  }
  
  return false
}

export function generateUserId(): string {
  return crypto.randomUUID()
}

export function generateSessionId(): string {
  return crypto.randomUUID()
}

export function parseRange(range?: string): { startDate: Date; endDate: Date } {
  const endDate = new Date()
  let startDate = new Date()
  
  if (!range) {
    startDate.setDate(endDate.getDate() - 7)
    return { startDate, endDate }
  }
  
  const match = range.match(/(\d+)([dwmy])/)
  if (!match) {
    startDate.setDate(endDate.getDate() - 7)
    return { startDate, endDate }
  }
  
  const [, num, unit] = match
  const amount = parseInt(num, 10)
  
  switch (unit) {
    case 'd':
      startDate.setDate(endDate.getDate() - amount)
      break
    case 'w':
      startDate.setDate(endDate.getDate() - (amount * 7))
      break
    case 'm':
      startDate.setMonth(endDate.getMonth() - amount)
      break
    case 'y':
      startDate.setFullYear(endDate.getFullYear() - amount)
      break
    default:
      startDate.setDate(endDate.getDate() - 7)
  }
  
  return { startDate, endDate }
}

export function parseOrigin(referrer?: string): string {
  if (!referrer) return 'direct'
  
  try {
    const url = new URL(referrer)
    const hostname = url.hostname.toLowerCase()
    
    if (hostname.includes('google')) return 'google'
    if (hostname.includes('facebook')) return 'facebook'
    if (hostname.includes('twitter')) return 'twitter'
    if (hostname.includes('linkedin')) return 'linkedin'
    if (hostname.includes('reddit')) return 'reddit'
    if (hostname.includes('github')) return 'github'
    
    return 'referral'
  } catch {
    return 'direct'
  }
}

export function extractUtmParams(url: string): Record<string, string> {
  try {
    const urlObj = new URL(url)
    const utm: Record<string, string> = {}
    
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
    
    for (const param of utmParams) {
      const value = urlObj.searchParams.get(param)
      if (value) {
        utm[param] = value
      }
    }
    
    return utm
  } catch {
    return {}
  }
}
