import { UAParser } from 'ua-parser-js'
import type { TDeviceInfo, TConnectionType, TUtmParams } from '../types.js'

export function collectDeviceInfo(): TDeviceInfo {
  const parser = new UAParser(navigator.userAgent)
  const result = parser.getResult()
  
  return {
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
    device: getDeviceType(result.device.type),
    screen: {
      width: window.screen.width,
      height: window.screen.height
    },
    language: navigator.language || 'en',
    connection: getConnectionType(),
    userAgent: navigator.userAgent
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

function getConnectionType(): TConnectionType {
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection
  
  if (!connection) return 'unknown'
  
  const effectiveType = connection.effectiveType
  
  switch (effectiveType) {
    case 'slow-2g':
      return 'slow-2g'
    case '2g':
      return '2g'
    case '3g':
      return '3g'
    case '4g':
      return '4g'
    default:
      return 'unknown'
  }
}

export function extractUtmParams(url?: string): TUtmParams {
  const urlObj = new URL(url || window.location.href)
  const params: TUtmParams = {}
  
  const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const
  
  for (const param of utmParams) {
    const value = urlObj.searchParams.get(param)
    if (value) {
      params[param] = value
    }
  }
  
  return params
}

export function getReferrer(): string {
  return document.referrer || ''
}

export function getCurrentUrl(): string {
  return window.location.href
}

export function isLocalhost(): boolean {
  const hostname = window.location.hostname.toLowerCase()
  return hostname === 'localhost' || 
         hostname === '127.0.0.1' || 
         hostname === '0.0.0.0' ||
         hostname.includes('.local')
}

export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset()
}
