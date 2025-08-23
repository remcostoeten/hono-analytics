'use client'

import { useState, useEffect } from 'react'

type TFlowStep = {
  id: string
  title: string
  description: string
  status: 'pending' | 'active' | 'complete' | 'error'
  timing?: number
}

type TProps = {
  autoPlay?: boolean
  className?: string
}

export function DataFlowVisualization({ autoPlay = false, className = '' }: TProps) {
  const [currentStep, setCurrentStep] = useState<number>(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [eventData, setEventData] = useState<any>(null)

  const flowSteps: TFlowStep[] = [
    {
      id: 'user-action',
      title: '👤 User Action',
      description: 'User visits a page or performs an action on your website'
    },
    {
      id: 'sdk-capture',
      title: '📱 SDK Capture',
      description: 'Analytics SDK detects the event and collects metadata'
    },
    {
      id: 'data-enrichment',
      title: '🔍 Data Enrichment', 
      description: 'SDK adds device info, geolocation, session data, and UTM parameters'
    },
    {
      id: 'api-request',
      title: '📡 API Request',
      description: 'SDK sends HTTP POST request to analytics backend'
    },
    {
      id: 'authentication',
      title: '🔐 Authentication',
      description: 'Backend validates API key and project authorization'
    },
    {
      id: 'data-processing',
      title: '⚡ Data Processing',
      description: 'Backend processes event data and creates/updates user sessions'
    },
    {
      id: 'database-storage',
      title: '🗄️ Database Storage',
      description: 'Event data is stored in PostgreSQL with proper relationships'
    },
    {
      id: 'response',
      title: '✅ Response',
      description: 'Backend returns 204 No Content to confirm successful tracking'
    }
  ].map((step, index) => ({
    ...step,
    status: currentStep > index ? 'complete' : currentStep === index ? 'active' : 'pending'
  }))

  async function playAnimation() {
    setIsPlaying(true)
    setCurrentStep(-1)
    
    // Generate sample event data
    const sampleEvent = {
      user: {
        id: `user-${Math.random().toString(36).substring(7)}`,
        device: 'desktop',
        browser: 'Chrome 120',
        os: 'macOS 14',
        country: 'Netherlands',
        city: 'Amsterdam'
      },
      session: {
        id: `session-${Math.random().toString(36).substring(7)}`,
        referrer: 'https://google.com/search?q=analytics',
        origin: 'google'
      },
      pageview: {
        url: '/dashboard',
        timestamp: new Date().toISOString(),
        durationMs: Math.floor(Math.random() * 5000) + 1000
      }
    }
    setEventData(sampleEvent)

    // Animate through each step
    for (let i = 0; i < flowSteps.length; i++) {
      setCurrentStep(i)
      await new Promise(resolve => setTimeout(resolve, 1200))
    }

    setCurrentStep(flowSteps.length)
    setIsPlaying(false)
  }

  function resetAnimation() {
    setCurrentStep(-1)
    setEventData(null)
    setIsPlaying(false)
  }

  useEffect(() => {
    if (autoPlay) {
      playAnimation()
    }
  }, [autoPlay])

  function getStepIcon(step: TFlowStep, index: number) {
    if (step.status === 'complete') return '✅'
    if (step.status === 'active') return '🔄'
    if (step.status === 'error') return '❌'
    return index + 1
  }

  function getConnectionStatus(index: number) {
    if (currentStep > index) return 'complete'
    if (currentStep === index) return 'active'
    return 'pending'
  }

  return (
    <div className={`data-flow-visualization ${className}`}>
      <div className="controls mb-6 p-4 bg-gradient-to-r from-blue-950/20 to-purple-950/20 rounded-lg border border-fd-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-fd-foreground">
            🌊 Analytics Data Flow Visualization
          </h3>
          <div className="flex gap-3">
            <button
              onClick={playAnimation}
              disabled={isPlaying}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isPlaying ? '⏳ Playing...' : '▶️ Play Animation'}
            </button>
            <button
              onClick={resetAnimation}
              disabled={isPlaying}
              className="px-4 py-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-neutral-500"
            >
              🔄 Reset
            </button>
          </div>
        </div>
        <p className="text-sm text-fd-muted-foreground">
          Watch how user actions flow through the analytics pipeline from frontend to database
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flow Visualization */}
        <div className="lg:col-span-2 space-y-4">
          {flowSteps.map((step, index) => (
            <div key={step.id} className="flex items-start">
              {/* Step Circle */}
              <div className="flex flex-col items-center mr-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-500 ${
                    step.status === 'complete'
                      ? 'bg-emerald-500 text-white'
                      : step.status === 'active'
                      ? 'bg-blue-500 text-white animate-pulse'
                      : step.status === 'error'
                      ? 'bg-red-500 text-white'
                      : 'bg-neutral-700 text-neutral-300'
                  }`}
                >
                  {getStepIcon(step, index)}
                </div>
                {index < flowSteps.length - 1 && (
                  <div
                    className={`w-0.5 h-12 mt-2 transition-all duration-500 ${
                      getConnectionStatus(index) === 'complete'
                        ? 'bg-emerald-500'
                        : getConnectionStatus(index) === 'active'
                        ? 'bg-blue-500'
                        : 'bg-neutral-600'
                    }`}
                  />
                )}
              </div>

              {/* Step Content */}
              <div
                className={`flex-1 p-4 rounded-lg transition-all duration-500 ${
                  step.status === 'active'
                    ? 'bg-blue-950/30 border-2 border-blue-600/50 transform scale-[1.02]'
                    : step.status === 'complete'
                    ? 'bg-emerald-950/20 border border-emerald-600/50'
                    : 'bg-fd-muted/20 border border-fd-border'
                }`}
              >
                <h4 className="font-semibold text-fd-foreground mb-1">{step.title}</h4>
                <p className="text-sm text-fd-muted-foreground">{step.description}</p>
                
                {/* Show timing for active/completed steps */}
                {step.status === 'active' && (
                  <div className="mt-2 text-xs text-blue-400 font-medium">
                    🔄 Processing...
                  </div>
                )}
                {step.status === 'complete' && (
                  <div className="mt-2 text-xs text-emerald-400 font-medium">
                    ✅ Completed in ~{Math.floor(Math.random() * 50) + 10}ms
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Event Data Panel */}
        <div className="space-y-4">
          <div className="bg-fd-card border border-fd-border rounded-lg overflow-hidden">
            <div className="bg-fd-muted/30 px-4 py-3 border-b border-fd-border">
              <h4 className="font-semibold text-fd-foreground">📊 Event Data</h4>
            </div>
            <div className="p-4">
              {eventData ? (
                <div className="space-y-3">
                  <div>
                    <h5 className="text-xs font-semibold text-fd-muted-foreground uppercase tracking-wide mb-1">
                      User Info
                    </h5>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-fd-muted-foreground">ID:</span>
                        <code className="text-xs bg-fd-muted/40 px-1 rounded text-fd-foreground">{eventData.user.id}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-fd-muted-foreground">Device:</span>
                        <span className="text-fd-foreground">{eventData.user.device}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-fd-muted-foreground">Location:</span>
                        <span className="text-fd-foreground">{eventData.user.city}, {eventData.user.country}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-fd-muted-foreground uppercase tracking-wide mb-1">
                      Session Info
                    </h5>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-fd-muted-foreground">ID:</span>
                        <code className="text-xs bg-fd-muted/40 px-1 rounded text-fd-foreground">{eventData.session.id}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-fd-muted-foreground">Origin:</span>
                        <span className="text-fd-foreground">{eventData.session.origin}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-fd-muted-foreground uppercase tracking-wide mb-1">
                      Pageview Info
                    </h5>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-fd-muted-foreground">URL:</span>
                        <code className="text-xs bg-fd-muted/40 px-1 rounded text-fd-foreground">{eventData.pageview.url}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-fd-muted-foreground">Duration:</span>
                        <span className="text-fd-foreground">{eventData.pageview.durationMs}ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-fd-muted-foreground py-8">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-sm">Event data will appear here during animation</p>
                </div>
              )}
            </div>
          </div>

          {/* Database Schema Preview */}
          <div className="bg-fd-card border border-fd-border rounded-lg overflow-hidden">
            <div className="bg-fd-muted/30 px-4 py-3 border-b border-fd-border">
              <h4 className="font-semibold text-fd-foreground">🗄️ Database Tables</h4>
            </div>
            <div className="p-4 space-y-3">
              <div 
                className={`p-2 rounded border transition-all duration-500 ${
                  currentStep >= 6 ? 'bg-emerald-950/20 border-emerald-600/50' : 'bg-fd-muted/20 border-fd-border'
                }`}
              >
                <div className="text-xs font-semibold text-fd-foreground mb-1">👥 users</div>
                <div className="text-xs text-fd-muted-foreground">User profiles & metadata</div>
              </div>
              <div 
                className={`p-2 rounded border transition-all duration-500 ${
                  currentStep >= 6 ? 'bg-emerald-950/20 border-emerald-600/50' : 'bg-fd-muted/20 border-fd-border'
                }`}
              >
                <div className="text-xs font-semibold text-fd-foreground mb-1">🔗 sessions</div>
                <div className="text-xs text-fd-muted-foreground">User sessions & referrers</div>
              </div>
              <div 
                className={`p-2 rounded border transition-all duration-500 ${
                  currentStep >= 6 ? 'bg-emerald-950/20 border-emerald-600/50' : 'bg-fd-muted/20 border-fd-border'
                }`}
              >
                <div className="text-xs font-semibold text-fd-foreground mb-1">📄 pageviews</div>
                <div className="text-xs text-fd-muted-foreground">Individual page visits</div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          {isPlaying && (
            <div className="bg-blue-950/20 border border-blue-600/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <div>
                  <div className="text-sm font-medium text-blue-300">
                    Processing Event...
                  </div>
                  <div className="text-xs text-blue-400">
                    Step {currentStep + 1} of {flowSteps.length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Benefits */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-950/20 border border-blue-600/50 rounded-lg p-4">
          <div className="text-blue-400 text-2xl mb-2">⚡</div>
          <h4 className="font-semibold text-blue-300 mb-1">Fast Processing</h4>
          <p className="text-sm text-blue-200">Events processed in milliseconds with efficient database operations</p>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-600/50 rounded-lg p-4">
          <div className="text-emerald-400 text-2xl mb-2">🔒</div>
          <h4 className="font-semibold text-emerald-300 mb-1">Secure & Private</h4>
          <p className="text-sm text-emerald-200">API key authentication with development traffic filtering</p>
        </div>
        <div className="bg-purple-950/20 border border-purple-600/50 rounded-lg p-4">
          <div className="text-purple-400 text-2xl mb-2">📊</div>
          <h4 className="font-semibold text-purple-300 mb-1">Rich Data</h4>
          <p className="text-sm text-purple-200">Automatic device detection, geolocation, and UTM tracking</p>
        </div>
      </div>

      <style jsx>{`
        .data-flow-visualization {
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .animate-pulse-scale {
          animation: pulse-scale 2s infinite;
        }
      `}</style>
    </div>
  )
}
