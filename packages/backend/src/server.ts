import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { config } from 'dotenv'
import { db } from './db/client.js'
import { trackRoute } from './routes/track.js'
import { metricsRoute } from './routes/metrics.js'
import type { TDatabase } from './db/client.js'

config()

type TBindings = {
  db: TDatabase
}

const app = new Hono<{ Bindings: TBindings }>()

app.use('*', cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:5173',
    'https://hono-analytics-docs.vercel.app'
  ],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-dev-traffic'],
  credentials: true
}))

app.use('*', logger())

app.use('*', async (c, next) => {
  c.env.db = db
  await next()
})

app.get('/', (c) => {
  const acceptHeader = c.req.header('accept') || ''
  
  // If JSON is requested, return JSON response
  if (acceptHeader.includes('application/json')) {
    return c.json({
      message: 'HONO Analytics API',
      version: '1.0.0',
      endpoints: {
        track: 'POST /track',
        metrics: 'GET /metrics'
      }
    })
  }
  
  // Return HTML page for browsers
	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <title>Hono Analytics API</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0a0a0a;
      --panel: #0d0d0d;
      --text: #f5f5f5;
      --muted: #9ca3af;
      --border: #1a1a1a;
      --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      --sans: 'Inter', ui-sans-serif, system-ui, -apple-system, Segoe UI, Inter, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--sans);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .wrapper { max-width: 920px; margin: 0 auto; padding: 64px 24px; }
    .header { display: flex; align-items: center; justify-content: space-between; }
    .brand { font-weight: 600; letter-spacing: 0.04em; color: #fff; }
    .badge { color: var(--muted); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; }
    .hero { margin-top: 56px; }
    h1 { font-size: 28px; font-weight: 600; }
    .gradient-text { background: linear-gradient(180deg, #ffffff, #9ca3af); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .subtitle { margin-top: 8px; color: var(--muted); }
    .section { margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--border); }
    .section-title { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; background: linear-gradient(180deg, #d4d4d8, #6b7280); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .endpoint { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
    .endpoint:last-child { border-bottom: none; }
    .method { font-weight: 700; font-size: 12px; letter-spacing: 0.05em; min-width: 54px; }
    .method.get { color: #60a5fa; }
    .method.post { color: #34d399; }
    .path { font-family: var(--mono); color: #e5e7eb; }
    .code { margin-top: 12px; background: #0e0e10; border: 1px solid var(--border); padding: 16px; font-family: var(--mono); font-size: 13px; color: #e5e7eb; white-space: pre-wrap; word-break: break-word; }
    .code .kw { color: #ffffff; font-weight: 600; }
    .code .opt { color: #a78bfa; }
    .code .url { color: #60a5fa; }
    .code .str { color: #fca5a5; }
    .code .meth { color: #34d399; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid var(--border); color: var(--muted); font-size: 12px; }
    a { color: #e5e7eb; text-decoration: none; border-bottom: 1px solid #2a2a2a; }
    a:hover { border-bottom-color: #7a7a7a; }
    .muted { color: var(--muted); }
  </style>
  <meta name="robots" content="noindex" />
</head>
<body>
  <main class="wrapper">
    <header class="header">
      <div class="brand gradient-text">HONO ANALYTICS</div>
      <div class="badge">API • v1.0.0</div>
    </header>

    <section class="hero">
      <h1 class="gradient-text">Minimal, fast analytics API</h1>
      <p class="subtitle">Just the essentials. Monochrome, minimal.</p>
    </section>

    <section class="section">
      <div class="section-title">Endpoints</div>
      <div class="endpoint"><span class="method get">GET</span><span class="path">/health</span></div>
      <div class="endpoint"><span class="method post">POST</span><span class="path">/track</span></div>
      <div class="endpoint"><span class="method get">GET</span><span class="path">/metrics</span></div>
    </section>

    <section class="section">
      <div class="section-title">Examples</div>
      <pre class="code">curl -s http://localhost:8080/health</pre>
      <pre class="code">curl -X POST http://localhost:8080/track -H 'Content-Type: application/json' -d '{"event":"pageview","path":"/"}'</pre>
    </section>

    <footer class="footer">
      <div>
        Built by <a href="https://github.com/remcostoeten" target="_blank" rel="noreferrer">@remcostoeten</a>
        with Hono + TypeScript • PostgreSQL (opt‑in SQLite)
      </div>
      <div class="muted" style="margin-top:8px">
        Read the <a href="https://hono-analytics-docs.vercel.app" target="_blank" rel="noreferrer">documentation</a>
        and view the source code on
        <a href="https://github.com/remcostoeten/hono-analytics" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </footer>
  </main>

  <script>
    (function(){
      var blocks = document.querySelectorAll('.code');
      blocks.forEach(function(pre){
        var s = pre.textContent;
        var html = s
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        html = html
          .replace(/\b(curl)\b/g, '<span class="kw">$1<\/span>')
          .replace(/(^|\s)(-{1,2}[A-Za-z-]+)/g, function(_, p1, p2){ return p1 + '<span class="opt">' + p2 + '<\/span>'; })
          .replace(/\b(POST|GET|PUT|DELETE|PATCH)\b/g, '<span class="meth">$1<\/span>')
          .replace(/(https?:\\\/\\\/[^\s'\"]+)/g, '<span class="url">$1<\/span>')
          .replace(/('[^']*'|\"[^\"]*\")/g, '<span class="str">$1<\/span>');
        pre.innerHTML = html;
      });
    })();
  </script>
</body>
</html>
	`
	
	return c.html(html)
})

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.route('/track', trackRoute)
app.route('/metrics', metricsRoute)

export { app }

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = parseInt(process.env.PORT || '8000')
  
  console.log(`🚀 HONO Analytics API starting on port ${port}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🗄️  Database: ${process.env.DATABASE_URL?.split('://')[0] || 'unknown'}`)
  
  serve({
    fetch: app.fetch,
    port,
    hostname: '0.0.0.0'
  })
  
  console.log(`✅ Server running on http://localhost:${port}`)
}
