import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">
          Documentation Site
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Welcome to your documentation site built with Fumadocs
        </p>
        <Link 
          href="/docs"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          View Documentation
        </Link>
      </div>
    </main>
  )
}