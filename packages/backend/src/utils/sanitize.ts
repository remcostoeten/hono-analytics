import sanitizeHtml from 'sanitize-html'

export function sanitizeText(input: string | undefined, maxLength: number = 1000): string {
  if (!input) return ''
  
  const cleaned = sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard'
  })
  
  return cleaned.substring(0, maxLength)
}

export function sanitizeUrl(url: string | undefined): string {
  if (!url) return ''
  
  try {
    const parsed = new URL(url)
    
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return ''
    }
    
    const sanitized = sanitizeHtml(url, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: 'discard'
    })
    
    return sanitized.substring(0, 2000)
  } catch {
    return ''
  }
}

export function sanitizeApiKey(key: string | undefined): string {
  if (!key) return ''
  
  const cleaned = key.replace(/[^a-zA-Z0-9-_]/g, '')
  return cleaned.substring(0, 100)
}

export function sanitizeCountryCode(code: string | undefined): string {
  if (!code) return ''
  
  const cleaned = code.replace(/[^A-Z]/g, '').toUpperCase()
  return cleaned.substring(0, 2)
}

export function sanitizeNumber(value: any): number | undefined {
  const num = Number(value)
  
  if (isNaN(num) || !isFinite(num)) {
    return undefined
  }
  
  return num
}

export function sanitizePayload<T extends Record<string, any>>(data: T): T {
  const sanitized: any = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value)
    } else if (typeof value === 'number') {
      sanitized[key] = sanitizeNumber(value)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizePayload(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized as T
}
