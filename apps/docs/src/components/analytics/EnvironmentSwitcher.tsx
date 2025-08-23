'use client'

import { useState } from 'react'
import type { TAnalyticsEnvironment } from '@/lib/analytics'

type TProps = {
  currentEnvironment: TAnalyticsEnvironment
  onEnvironmentChange: (environment: TAnalyticsEnvironment) => void
  className?: string
}

export function EnvironmentSwitcher({ 
  currentEnvironment, 
  onEnvironmentChange, 
  className = '' 
}: TProps) {
  const environments = [
    {
      key: 'development' as const,
      label: 'Development',
      description: 'Local development analytics',
      icon: '⚡',
      color: 'blue'
    },
    {
      key: 'production' as const,
      label: 'Production', 
      description: 'Live site analytics',
      icon: '🚀',
      color: 'emerald'
    },
    {
      key: 'combined' as const,
      label: 'Combined',
      description: 'Development + Production',
      icon: '📊',
      color: 'purple'
    }
  ]

  function getEnvironmentStyle(env: TAnalyticsEnvironment, isActive: boolean) {
    const colors = {
      blue: isActive 
        ? 'bg-blue-500 text-white border-blue-500' 
        : 'bg-blue-950/20 text-blue-400 border-blue-600/50 hover:bg-blue-950/30',
      emerald: isActive 
        ? 'bg-emerald-500 text-white border-emerald-500' 
        : 'bg-emerald-950/20 text-emerald-400 border-emerald-600/50 hover:bg-emerald-950/30',
      purple: isActive 
        ? 'bg-purple-500 text-white border-purple-500' 
        : 'bg-purple-950/20 text-purple-400 border-purple-600/50 hover:bg-purple-950/30'
    }
    
    const envConfig = environments.find(e => e.key === env)
    return colors[envConfig?.color as keyof typeof colors] || colors.blue
  }

  return (
    <div className={`environment-switcher ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-semibold text-fd-foreground">Analytics Environment</h4>
          <p className="text-sm text-fd-muted-foreground">Switch between different data sources</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-fd-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Data</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {environments.map((env) => {
          const isActive = currentEnvironment === env.key
          
          return (
            <button
              key={env.key}
              onClick={() => onEnvironmentChange(env.key)}
              className={`p-3 rounded-lg border transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getEnvironmentStyle(env.key, isActive)
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg" role="img" aria-label={env.label}>
                  {env.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {env.label}
                  </div>
                  <div className="text-xs opacity-80 mt-0.5">
                    {env.description}
                  </div>
                  {isActive && (
                    <div className="text-xs mt-1 font-medium">
                      ✓ Active
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Status indicators */}
      <div className="mt-4 p-3 bg-fd-muted/20 rounded-lg border border-fd-border">
        <div className="text-xs text-fd-muted-foreground space-y-1">
          <div className="flex justify-between items-center">
            <span>Current Environment:</span>
            <span className="font-medium text-fd-foreground capitalize">
              {environments.find(e => e.key === currentEnvironment)?.label}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Real-time Updates:</span>
            <span className="text-emerald-400 font-medium">Enabled</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Data Refresh:</span>
            <span className="text-blue-400 font-medium">Every 5s</span>
          </div>
        </div>
      </div>
    </div>
  )
