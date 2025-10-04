'use client'

import { useState } from 'react'

type TProps = {
  label?: string
  showCopyButton?: boolean
}

function generateSecureKey(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function ApiKeyGenerator({ label = 'Generated API Key', showCopyButton = true }: TProps) {
  const [apiKey, setApiKey] = useState<string>('')
  const [copied, setCopied] = useState(false)

  function handleGenerate() {
    const newKey = generateSecureKey()
    setApiKey(newKey)
    setCopied(false)
  }

  async function handleCopy() {
    if (!apiKey) return
    
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(function resetCopied() {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="not-prose my-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {label}
        </h3>
        <button
          onClick={handleGenerate}
          className="px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Generate Key
        </button>
      </div>

      {apiKey && (
        <div className="space-y-3">
          <div className="relative">
            <code className="block w-full p-3 pr-20 text-sm font-mono bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md overflow-x-auto text-gray-900 dark:text-gray-100">
              {apiKey}
            </code>
            {showCopyButton && (
              <button
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>

          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p>Add this to your <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded">packages/backend/.env</code>:</p>
            <code className="block p-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded text-gray-900 dark:text-gray-100">
              DEFAULT_API_KEY={apiKey}
            </code>
          </div>
        </div>
      )}

      {!apiKey && (
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Click "Generate Key" to create a secure random API key
        </p>
      )}
    </div>
  )
}
