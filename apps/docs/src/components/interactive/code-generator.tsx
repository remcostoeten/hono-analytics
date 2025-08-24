'use client'

import { useState } from 'react'

type TFramework = 'react' | 'vue' | 'svelte' | 'vanilla'
type TLanguage = 'typescript' | 'javascript'

type TProps = {
  defaultFramework?: TFramework
  className?: string
}

type TCodeConfig = {
  framework: TFramework
  language: TLanguage
  apiKey: string
  projectId: string
  endpoint: string
  debug: boolean
  ignoreAnalytics: boolean
}

export function CodeGenerator({ defaultFramework = 'react', className = '' }: TProps) {
  const [config, setConfig] = useState<TCodeConfig>({
    framework: defaultFramework,
    language: 'typescript',
    apiKey: 'your-api-key',
    projectId: 'your-project-id',
    endpoint: 'https://analytics.example.com',
    debug: false,
    ignoreAnalytics: false
  })

  const [activeTab, setActiveTab] = useState<'setup' | 'usage' | 'advanced'>('setup')

  function generateInstallCommand(): string {
    return 'npm install @hono-analytics/sdk\n# or\npnpm add @hono-analytics/sdk\n# or\nyarn add @hono-analytics/sdk'
  }

  function generateSetupCode(): string {
    const { framework, language, apiKey, projectId, endpoint, debug, ignoreAnalytics } = config
    const isTypeScript = language === 'typescript'
    const fileExt = isTypeScript ? 'tsx' : 'jsx'

    if (framework === 'react') {
      return `${isTypeScript ? "import { ReactNode } from 'react'" : ''}
import { AnalyticsProvider } from '@hono-analytics/sdk/react'

${isTypeScript ? `type TProps = {
  children: ReactNode
}

export function App({ children }: TProps) {` : 'export function App({ children }) {'}
  return (
    <AnalyticsProvider
      apiKey="${apiKey}"
      projectId="${projectId}"
      endpoint="${endpoint}"${debug ? '\n      debug={true}' : ''}${ignoreAnalytics ? '\n      ignoreAnalytics={true}' : ''}
    >
      {children}
    </AnalyticsProvider>
  )
}`
    }

    if (framework === 'vue') {
      return `${isTypeScript ? '// main.ts' : '// main.js'}
import { createApp } from 'vue'
import { initAnalytics } from '@hono-analytics/sdk'
import App from './App.vue'

const analytics = initAnalytics({
  apiKey: '${apiKey}',
  projectId: '${projectId}',  
  endpoint: '${endpoint}',${debug ? '\n  debug: true,' : ''}${ignoreAnalytics ? '\n  ignoreAnalytics: true,' : ''}
})

const app = createApp(App)

// Make analytics available globally
app.config.globalProperties.$analytics = analytics

app.mount('#app')`
    }

    if (framework === 'svelte') {
      return `${isTypeScript ? '// src/lib/analytics.ts' : '// src/lib/analytics.js'}
import { initAnalytics } from '@hono-analytics/sdk'

export const analytics = initAnalytics({
  apiKey: '${apiKey}',
  projectId: '${projectId}',
  endpoint: '${endpoint}',${debug ? '\n  debug: true,' : ''}${ignoreAnalytics ? '\n  ignoreAnalytics: true,' : ''}
})`
    }

    if (framework === 'vanilla') {
      return `${isTypeScript ? '// analytics.ts' : '// analytics.js'}
import { initAnalytics } from '@hono-analytics/sdk'

const analytics = initAnalytics({
  apiKey: '${apiKey}',
  projectId: '${projectId}',
  endpoint: '${endpoint}',${debug ? '\n  debug: true,' : ''}${ignoreAnalytics ? '\n  ignoreAnalytics: true,' : ''}
})

export { analytics }`
    }

    return ''
  }

  function generateUsageCode(): string {
    const { framework, language } = config
    const isTypeScript = language === 'typescript'

    if (framework === 'react') {
      return `import { useAnalytics } from '@hono-analytics/sdk/react'${isTypeScript ? "\nimport { useEffect } from 'react'" : ''}

function MyComponent() {
  const analytics = useAnalytics()
  
  ${isTypeScript ? 'async function' : 'async function'} handleCustomEvent() {
    await analytics.track({
      url: '/button-clicked',
      durationMs: 1000
    })
  }
  
  ${isTypeScript ? 'function' : 'function'} handleUserLogin() {
    analytics.identify({
      id: 'user-123',
      country: 'Netherlands',
      city: 'Amsterdam'
    })
  }
  
  return (
    <div>
      <button onClick={handleCustomEvent}>
        Track Event
      </button>
      <button onClick={handleUserLogin}>
        Identify User
      </button>
    </div>
  )
}`
    }

    if (framework === 'vue') {
      return `<template>
  <div>
    <button @click="trackCustomEvent">Track Event</button>
    <button @click="identifyUser">Identify User</button>
  </div>
</template>

<script${isTypeScript ? ' setup lang="ts"' : ''}>
${framework === 'vue' && language === 'javascript' ? `export default {
  methods: {
    async trackCustomEvent() {
      await this.$analytics.track({
        url: '/button-clicked',
        durationMs: 1000
      })
    },
    
    identifyUser() {
      this.$analytics.identify({
        id: 'user-123',
        country: 'Netherlands'
      })
    }
  }
}` : `${isTypeScript ? "import { getCurrentInstance } from 'vue'" : ''}

const instance = getCurrentInstance()
const analytics = instance?.appContext.config.globalProperties.$analytics

async function trackCustomEvent() {
  await analytics.track({
    url: '/button-clicked',
    durationMs: 1000
  })
}

function identifyUser() {
  analytics.identify({
    id: 'user-123',
    country: 'Netherlands'
  })
}`}
</script>`
    }

    if (framework === 'svelte') {
      return `<script${isTypeScript ? ' lang="ts"' : ''}>
  import { analytics } from '$lib/analytics'
  
  async function trackCustomEvent() {
    await analytics.track({
      url: '/button-clicked',
      durationMs: 1000
    })
  }
  
  function identifyUser() {
    analytics.identify({
      id: 'user-123',
      country: 'Netherlands'
    })
  }
</script>

<div>
  <button on:click={trackCustomEvent}>Track Event</button>
  <button on:click={identifyUser}>Identify User</button>
</div>`
    }

    if (framework === 'vanilla') {
      return `import { track, identify } from '@hono-analytics/sdk'

// Track custom events
async function trackCustomEvent() {
  await track({
    url: '/button-clicked',
    durationMs: 1000
  })
}

// Identify users
function identifyUser() {
  identify({
    id: 'user-123',
    country: 'Netherlands',
    city: 'Amsterdam'
  })
}

// Add event listeners
document.getElementById('track-btn')?.addEventListener('click', trackCustomEvent)
document.getElementById('identify-btn')?.addEventListener('click', identifyUser)`
    }

    return ''
  }

  function generateAdvancedCode(): string {
    const { framework, language } = config
    const isTypeScript = language === 'typescript'

    if (framework === 'react') {
      return `import { useAnalytics } from '@hono-analytics/sdk/react'
import { useEffect, useState } from 'react'${isTypeScript ? '\nimport type { TUserData } from "@hono-analytics/sdk/react"' : ''}

function AdvancedTracking() {
  const analytics = useAnalytics()
  const [startTime] = useState(Date.now())
  
  useEffect(() => {
    // Track page view on mount
    analytics.track({
      url: window.location.pathname,
      durationMs: 0
    })
    
    // Track time on page when component unmounts
    return () => {
      analytics.track({
        url: \`\${window.location.pathname}/exit\`,
        durationMs: Date.now() - startTime
      })
    }
  }, [analytics, startTime])
  
  ${isTypeScript ? 'async function' : 'async function'} trackWithTiming(eventName${isTypeScript ? ': string' : ''}) {
    const start = Date.now()
    
    // Simulate some async operation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await analytics.track({
      url: \`/timed-event/\${eventName}\`,
      durationMs: Date.now() - start
    })
  }
  
  ${isTypeScript ? 'function' : 'function'} identifyUserWithContext(userData${isTypeScript ? ': Partial<TUserData>' : ''}) {
    analytics.identify({
      ...userData,
      // Add context from URL parameters
      ...(new URLSearchParams(window.location.search).get('utm_source') && {
        utm_source: new URLSearchParams(window.location.search).get('utm_source')
      })
    })
  }
  
  return (
    <div>
      <button onClick={() => trackWithTiming('purchase')}>
        Track Timed Event
      </button>
      <button onClick={() => identifyUserWithContext({ id: 'advanced-user' })}>
        Advanced Identify
      </button>
    </div>
  )
}`
    }

    return `// Advanced patterns for ${framework}
// Page performance tracking
window.addEventListener('load', async () => {
  const navigation = performance.getEntriesByType('navigation')[0]${isTypeScript ? ' as PerformanceNavigationTiming' : ''}
  
  await track({
    url: '/performance/page-load',
    durationMs: Math.round(navigation.loadEventEnd - navigation.loadEventStart)
  })
})

// Error tracking
window.addEventListener('error', async (event) => {
  await track({
    url: '/error/javascript',
    durationMs: 0
  })
})

// User engagement tracking
let scrollDepth = 0
window.addEventListener('scroll', () => {
  const currentDepth = Math.round((window.scrollY / document.body.scrollHeight) * 100)
  if (currentDepth > scrollDepth && currentDepth % 25 === 0) {
    scrollDepth = currentDepth
    track({
      url: \`/engagement/scroll-\${scrollDepth}%\`,
      durationMs: 0
    })
  }
})`
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
    })
  }

  const currentCode = activeTab === 'setup' 
    ? generateSetupCode()
    : activeTab === 'usage'
    ? generateUsageCode()
    : generateAdvancedCode()

  return (
    <div className={`code-generator ${className}`}>
      <div className="controls mb-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">⚙️ Code Generator</h3>
        <p className="text-sm text-gray-600 mb-4">
          Customize your analytics integration and get copy-paste ready code
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Framework Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Framework</label>
            <select
              value={config.framework}
              onChange={(e) => setConfig(prev => ({ ...prev, framework: e.target.value as TFramework }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="react">React / Next.js</option>
              <option value="vue">Vue.js</option>
              <option value="svelte">Svelte / SvelteKit</option>
              <option value="vanilla">Vanilla JavaScript</option>
            </select>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={config.language}
              onChange={(e) => setConfig(prev => ({ ...prev, language: e.target.value as TLanguage }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          {/* API Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <input
              type="text"
              value={config.apiKey}
              onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your-api-key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project ID</label>
            <input
              type="text"
              value={config.projectId}
              onChange={(e) => setConfig(prev => ({ ...prev, projectId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your-project-id"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint</label>
            <input
              type="url"
              value={config.endpoint}
              onChange={(e) => setConfig(prev => ({ ...prev, endpoint: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://analytics.example.com"
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Options</label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.debug}
                onChange={(e) => setConfig(prev => ({ ...prev, debug: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable debug mode</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.ignoreAnalytics}
                onChange={(e) => setConfig(prev => ({ ...prev, ignoreAnalytics: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Disable tracking</span>
            </label>
          </div>
        </div>
      </div>

      {/* Code Tabs */}
      <div className="border rounded-lg overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'setup'
                ? 'border-blue-500 text-blue-600 bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📦 Installation & Setup
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'usage'
                ? 'border-blue-500 text-blue-600 bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            🎯 Basic Usage
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'advanced'
                ? 'border-blue-500 text-blue-600 bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            🚀 Advanced Patterns
          </button>
        </div>

        {/* Code Content */}
        <div className="relative">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => copyToClipboard(currentCode)}
              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              📋 Copy Code
            </button>
          </div>

          {activeTab === 'setup' && (
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">1. Install the SDK</h4>
              <pre className="text-xs bg-gray-100 p-3 rounded mb-4 overflow-x-auto">
                <code>{generateInstallCommand()}</code>
              </pre>
              
              <h4 className="text-sm font-semibold text-gray-800 mb-3">2. Setup Analytics Provider</h4>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                <code>{currentCode}</code>
              </pre>
            </div>
          )}

          {(activeTab === 'usage' || activeTab === 'advanced') && (
            <div className="p-4">
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                <code>{currentCode}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Framework-specific Notes */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">
          📝 {config.framework.charAt(0).toUpperCase() + config.framework.slice(1)} Specific Notes
        </h4>
        {config.framework === 'react' && (
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use environment variables with <code>NEXT_PUBLIC_</code> prefix for Next.js</li>
            <li>• The provider must wrap your entire app or the components that need analytics</li>
            <li>• Automatic pageview tracking works with Next.js router</li>
          </ul>
        )}
        {config.framework === 'vue' && (
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use environment variables with <code>VITE_</code> prefix for Vite</li>
            <li>• Analytics instance is available globally as <code>this.$analytics</code></li>
            <li>• Consider using a composable for Vue 3 Composition API</li>
          </ul>
        )}
        {config.framework === 'svelte' && (
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use environment variables with <code>VITE_</code> prefix</li>
            <li>• Import analytics from the lib file in each component</li>
            <li>• Consider using a Svelte store for reactive analytics state</li>
          </ul>
        )}
        {config.framework === 'vanilla' && (
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Works with any bundler (Webpack, Vite, Rollup, etc.)</li>
            <li>• Can be used with CDN imports for quick prototyping</li>
            <li>• Manual event listener setup required for interactive tracking</li>
          </ul>
        )}
      </div>

      <style jsx>{`
        .code-generator {
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        code {
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        }
      `}</style>
    </div>
  )
}
