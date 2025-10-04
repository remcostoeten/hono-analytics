export type TParsedUserAgent = {
  browser: string
  browserVersion: string
  device: string
  os: string
}

export function parseUserAgent(userAgent: string): TParsedUserAgent {
  const ua = userAgent.toLowerCase()

  // Parse browser
  let browser = 'Unknown'
  let browserVersion = ''

  if (ua.includes('edg/')) {
    browser = 'Edge'
    browserVersion = extractVersion(ua, 'edg/')
  } else if (ua.includes('chrome/')) {
    browser = 'Chrome'
    browserVersion = extractVersion(ua, 'chrome/')
  } else if (ua.includes('firefox/')) {
    browser = 'Firefox'
    browserVersion = extractVersion(ua, 'firefox/')
  } else if (ua.includes('safari/') && !ua.includes('chrome')) {
    browser = 'Safari'
    browserVersion = extractVersion(ua, 'version/')
  } else if (ua.includes('opera/') || ua.includes('opr/')) {
    browser = 'Opera'
    browserVersion = extractVersion(ua, ua.includes('opr/') ? 'opr/' : 'opera/')
  }

  // Parse device type
  let device = 'Desktop'

  if (ua.includes('mobile') || ua.includes('android')) {
    device = 'Mobile'
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device = 'Tablet'
  }

  // Parse OS
  let os = 'Unknown'

  if (ua.includes('windows')) {
    os = 'Windows'
  } else if (ua.includes('mac os')) {
    os = 'macOS'
  } else if (ua.includes('linux')) {
    os = 'Linux'
  } else if (ua.includes('android')) {
    os = 'Android'
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS'
  }

  return {
    browser,
    browserVersion,
    device,
    os
  }
}

function extractVersion(ua: string, marker: string): string {
  const index = ua.indexOf(marker)
  if (index === -1) return ''
  
  const versionStart = index + marker.length
  const versionStr = ua.substring(versionStart)
  const match = versionStr.match(/^(\d+(\.\d+)*)/)
  
  return match ? match[1] : ''
}
