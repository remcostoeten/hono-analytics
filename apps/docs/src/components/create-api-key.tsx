'use client'

import { useState } from 'react'
import { Copy, Check, Key, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function CreateApiKey() {
  const [apiKey, setApiKey] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  function generateApiKey() {
    setIsGenerating(true)
    
    setTimeout(() => {
      const timestamp = Date.now().toString(36)
      const random = Math.random().toString(36).substring(2, 15)
      const newApiKey = `honolytics_${timestamp}_${random}`
      setApiKey(newApiKey)
      setCopied(false)
      setIsGenerating(false)
      setIsRevealed(false)
    }, 600)
  }

  async function copyToClipboard() {
    if (apiKey) {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function getMaskedKey(key: string): string {
    if (isRevealed) return key
    if (isHovering) {
      const prefixLength = 15
      const suffixLength = 8
      if (key.length <= prefixLength + suffixLength) return key
      const prefix = key.substring(0, prefixLength)
      const suffix = key.substring(key.length - suffixLength)
      const maskLength = key.length - prefixLength - suffixLength
      return `${prefix}${'•'.repeat(Math.min(maskLength, 12))}${suffix}`
    }
    return '•'.repeat(Math.min(key.length, 32))
  }

  return (
    <div className="not-prose my-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-lg border border-fd-border bg-fd-card p-5"
      >
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-fd-muted">
              <Key className="h-4 w-4 text-fd-muted-foreground" />
            </div>
            <h3 className="text-base font-medium text-fd-foreground">Generate API Key</h3>
          </div>
          <p className="text-sm text-fd-muted-foreground ml-10.5">
            Create a secure key for your application
          </p>
        </div>
        
        {/* Generate Button */}
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
          onClick={generateApiKey}
          disabled={isGenerating}
          className="w-full rounded-md bg-fd-foreground px-4 py-2.5 text-sm font-medium text-fd-background transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-fd-background border-t-transparent" />
              Generating...
            </span>
          ) : (
            'Generate'
          )}
        </motion.button>
        
        {/* API Key Display */}
        <AnimatePresence mode="wait">
          {apiKey && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-fd-muted-foreground uppercase tracking-wide">
                  Your key
                </label>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1 text-xs text-fd-muted-foreground"
                >
                  <div className="h-1 w-1 rounded-full bg-green-500" />
                  Generated
                </motion.div>
              </div>
              
              <div className="flex items-stretch gap-2">
                <div 
                  className="relative flex-1 group/secret"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <motion.div
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.05 }}
                    className={`relative rounded-md border transition-all duration-200 ${
                      isHovering || isRevealed 
                        ? 'border-fd-foreground/20 bg-fd-accent' 
                        : 'border-fd-border bg-fd-background'
                    }`}
                  >
                    <code 
                      className="block w-full px-3 py-2.5 pr-9 font-mono text-xs text-fd-foreground break-all transition-all duration-200 cursor-pointer hover:bg-fd-muted/50"
                      onClick={copyToClipboard}
                      title="Click to copy API key"
                    >
                      {getMaskedKey(apiKey)}
                    </code>
                    
                    <button
                      onClick={() => setIsRevealed(!isRevealed)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 transition-colors hover:bg-fd-muted"
                      title={isRevealed ? 'Hide' : 'Show'}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {isRevealed ? (
                          <motion.div
                            key="hide"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <EyeOff className="h-3.5 w-3.5 text-fd-muted-foreground" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="show"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Eye className="h-3.5 w-3.5 text-fd-muted-foreground" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                    
                    <AnimatePresence>
                      {!isRevealed && isHovering && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute -top-9 left-0 pointer-events-none"
                        >
                          <div className="rounded bg-fd-popover px-2 py-1 text-xs text-fd-popover-foreground shadow-sm border border-fd-border whitespace-nowrap">
                            Hover to peek • Click eye to reveal
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
                
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyToClipboard}
                  className="flex items-center justify-center rounded-md border border-fd-border bg-fd-background px-3 transition-colors hover:bg-fd-accent"
                  title="Copy"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Copy className="h-3.5 w-3.5 text-fd-muted-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 px-3 py-2"
              >
                <span className="text-amber-600 dark:text-amber-500 text-sm mt-0.5">⚠️</span>
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  Save this key securely. You won't be able to see it again.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
