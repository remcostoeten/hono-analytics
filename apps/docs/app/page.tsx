import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4">
          🔍 HONO Analytics
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          React hooks for analytics dashboards
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          v0.12.0 - Request deduplication, exponential backoff, date validation & more
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link 
            href="/demo"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            🎮 Live Demo
          </Link>
          <Link 
            href="/docs"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            📖 Documentation
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6 text-left">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">✨ Features</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Request deduplication</li>
              <li>• Exponential backoff</li>
              <li>• Date validation</li>
              <li>• TypeScript support</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">⚡ Quick Start</h3>
            <code className="text-xs bg-muted p-2 rounded block">
              bun add @hono-analytics/dashboard-hooks
            </code>
          </div>
        </div>
      </div>
    </main>
  )
}
