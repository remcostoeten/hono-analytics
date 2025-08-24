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


