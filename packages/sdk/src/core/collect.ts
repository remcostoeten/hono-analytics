import { UAParser } from 'ua-parser-js'
import type { TDeviceInfo, TConnectionType } from '../types.js'

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


export function getReferrer(): string {
  return document.referrer || ''
}

export function getCurrentUrl(): string {
  return window.location.href
}


