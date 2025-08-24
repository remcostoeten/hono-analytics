'use client'

import { useState, useEffect } from 'react'

type TApiRequest = {
  id: string
  method: string
  url: string
  headers: Record<string, string>
  body?: any
  timestamp: number
}

type TApiResponse = {
  id: string
  status: number
  statusText: string
  data?: any
  timing: number
  timestamp: number
}

type TProps = {
  endpoint?: string
  apiKey?: string
  className?: string
}

export function ApiVisualizer({ 
  endpoint = 'http://localhost:8000', 
  apiKey = 'demo-key',
  className = ''
}: TProps) {
  const [requests, setRequests] = useState<TApiRequest[]>([])
  const [responses, setResponses] = useState<TApiResponse[]>([])
  const [isTracking, setIsTracking] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)

  async function sendTrackEvent(eventData: any) {
    const requestId = Math.random().toString(36).substring(7)
    const startTime = Date.now()
    
    const request: TApiRequest = {
      id: requestId,
      method: 'POST',
      url: `${endpoint}/track`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: eventData,
      timestamp: startTime
    }

    setRequests(prev => [request, ...prev.slice(0, 4)])
    setIsTracking(true)

    try {
      const response = await fetch(`${endpoint}/track`, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(eventData)
      })

      const responseData = response.status !== 204 ? await response.json().catch(() => null) : null
      const endTime = Date.now()

      const responseObj: TApiResponse = {
        id: requestId,
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        timing: endTime - startTime,
        timestamp: endTime
      }

      setResponses(prev => [responseObj, ...prev.slice(0, 4)])
    } catch (error) {
      const responseObj: TApiResponse = {
        id: requestId,
        status: 0,
        statusText: 'Network Error',
        data: { error: error instanceof Error ? error.message : String(error) },
        timing: Date.now() - startTime,
        timestamp: Date.now()
      }

      setResponses(prev => [responseObj, ...prev.slice(0, 4)])
    } finally {
      setIsTracking(false)
    }
  }

  async function sendCustomEvent() {
    await sendTrackEvent({
      user: {
        id: `demo-user-${Math.floor(Math.random() * 1000)}`,
        device: 'desktop',
        browser: 'Chrome 120',
        country: 'Netherlands'
      },
      session: {
        id: `session-${Math.floor(Math.random() * 1000)}`,
        referrer: 'https://docs.example.com',
        origin: 'docs'
      },
      pageview: {
        url: `/demo-page-${Math.floor(Math.random() * 10)}`,
        timestamp: new Date().toISOString(),
        durationMs: Math.floor(Math.random() * 5000) + 1000
      }
    })
  }

  async function identifyUser() {
    await sendTrackEvent({
      user: {
        id: `identified-user-${Math.floor(Math.random() * 100)}`,
        device: 'desktop',
        browser: 'Safari 17',
        country: 'Germany',
        city: 'Berlin'
      },
      session: {
        id: `session-${Math.floor(Math.random() * 1000)}`,
        referrer: 'https://google.com',
        origin: 'google'
      },
      pageview: {
        url: '/user-identification',
        timestamp: new Date().toISOString()
      }
    })
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  function formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2)
  }

  function getCurlCommand(request: TApiRequest): string {
    const headers = Object.entries(request.headers)
      .map(([key, value]) => `-H "${key}: ${value}"`)
      .join(' ')
    
    return `curl -X ${request.method} "${request.url}" ${headers} -d '${JSON.stringify(request.body)}'`
  }

  const selectedRequestData = selectedRequest 
    ? requests.find(r => r.id === selectedRequest)
    : null
  const selectedResponseData = selectedRequest 
    ? responses.find(r => r.id === selectedRequest)
    : null

  return (
    <div className={`api-visualizer ${className}`}>
      <div className="controls mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">🔬 API Testing Playground</h3>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={sendCustomEvent}
            disabled={isTracking}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTracking ? '📡 Sending...' : '📊 Send Page View'}
          </button>
          <button
            onClick={identifyUser}
            disabled={isTracking}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTracking ? '📡 Sending...' : '👤 Identify User'}
          </button>
          <div className="text-sm text-gray-600 flex items-center">
            <span className="mr-2">Endpoint:</span>
            <code className="bg-gray-200 px-2 py-1 rounded text-xs">{endpoint}</code>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request List */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 flex items-center">
            📤 Recent Requests
            {requests.length > 0 && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {requests.length}
              </span>
            )}
          </h4>
          {requests.length === 0 ? (
            <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              No requests yet. Try sending an event above! 👆
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                onClick={() => setSelectedRequest(request.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedRequest === request.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {request.method}
                    </span>
                    <span className="text-sm text-gray-600 truncate">
                      {request.url}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(request.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Response List */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 flex items-center">
            📥 Recent Responses
            {responses.length > 0 && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {responses.length}
              </span>
            )}
          </h4>
          {responses.length === 0 ? (
            <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              Responses will appear here ⏳
            </div>
          ) : (
            responses.map((response) => (
              <div
                key={response.id}
                onClick={() => setSelectedRequest(response.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedRequest === response.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs px-2 py-1 rounded ${
                      response.status >= 200 && response.status < 300 
                        ? 'bg-green-100 text-green-800'
                        : response.status >= 400
                        ? 'bg-red-100 text-red-800'  
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {response.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      {response.statusText}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({response.timing}ms)
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(response.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Request/Response Details */}
      {selectedRequestData && (
        <div className="mt-6 border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 border-b">
            <h5 className="font-semibold flex items-center justify-between">
              📋 Request/Response Details
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ✕ Close
              </button>
            </h5>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-gray-200">
            {/* Request Details */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h6 className="font-medium text-gray-800">📤 Request</h6>
                <button
                  onClick={() => copyToClipboard(getCurlCommand(selectedRequestData))}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                >
                  📋 Copy cURL
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">URL</label>
                  <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
                    {selectedRequestData.method} {selectedRequestData.url}
                  </code>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Headers</label>
                  <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
                    {formatJson(selectedRequestData.headers)}
                  </code>
                </div>
                
                {selectedRequestData.body && (
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Body</label>
                    <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto max-h-48 overflow-y-auto">
                      {formatJson(selectedRequestData.body)}
                    </code>
                  </div>
                )}
              </div>
            </div>

            {/* Response Details */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h6 className="font-medium text-gray-800">📥 Response</h6>
                {selectedResponseData && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    selectedResponseData.status >= 200 && selectedResponseData.status < 300 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedResponseData.timing}ms
                  </span>
                )}
              </div>

              {selectedResponseData ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
                    <code className={`text-xs px-2 py-1 rounded inline-block ${
                      selectedResponseData.status >= 200 && selectedResponseData.status < 300 
                        ? 'bg-green-100 text-green-800'
                        : selectedResponseData.status >= 400
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedResponseData.status} {selectedResponseData.statusText}
                    </code>
                  </div>

                  {selectedResponseData.data && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Response Data</label>
                      <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto max-h-48 overflow-y-auto">
                        {formatJson(selectedResponseData.data)}
                      </code>
                    </div>
                  )}

                  {selectedResponseData.status === 204 && (
                    <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                      ✅ Success! Event tracked successfully (204 No Content)
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  Response pending...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .api-visualizer {
          font-family: system-ui, -apple-system, sans-serif;
        }
      `}</style>
    </div>
  )
}
