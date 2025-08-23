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
    <title>Hono Analytics API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        
        .logo {
            font-size: 48px;
            margin-bottom: 10px;
        }
        
        .title {
            font-size: 32px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 10px;
        }
        
        .version {
            color: #718096;
            font-size: 16px;
            margin-bottom: 30px;
        }
        
        .status {
            display: inline-flex;
            align-items: center;
            background: #48bb78;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 30px;
        }
        
        .status::before {
            content: '●';
            margin-right: 8px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .endpoints {
            background: #f7fafc;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            text-align: left;
        }
        
        .endpoints h3 {
            color: #2d3748;
            margin-bottom: 16px;
            font-size: 18px;
        }
        
        .endpoint {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .endpoint:last-child {
            border-bottom: none;
        }
        
        .method {
            background: #4299e1;
            color: white;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            min-width: 60px;
            text-align: center;
        }
        
        .method.post {
            background: #48bb78;
        }
        
        .method.get {
            background: #4299e1;
        }
        
        .path {
            font-family: 'Monaco', 'Menlo', monospace;
            color: #4a5568;
            font-weight: 500;
        }
        
        .description {
            color: #718096;
            font-size: 14px;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 16px;
            margin: 24px 0;
        }
        
        .stat {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 4px;
        }
        
        .stat-label {
            font-size: 12px;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 14px;
        }
        
        .footer a {
            color: #4299e1;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 480px) {
            .container {
                padding: 24px;
            }
            
            .title {
                font-size: 24px;
            }
            
            .logo {
                font-size: 36px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">📊</div>
        <h1 class="title">Hono Analytics API</h1>
        <p class="version">Version 1.0.0</p>
        <div class="status">API Online</div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-value">99.9%</div>
                <div class="stat-label">Uptime</div>
            </div>
            <div class="stat">
                <div class="stat-value">&lt;50ms</div>
                <div class="stat-label">Response Time</div>
            </div>
            <div class="stat">
                <div class="stat-value">Neon</div>
                <div class="stat-label">Database</div>
            </div>
        </div>
        
        <div class="endpoints">
            <h3>🛠️ Available Endpoints</h3>
            
            <div class="endpoint">
                <div>
                    <span class="method get">GET</span>
                    <span class="path">/health</span>
                </div>
                <div class="description">Health check</div>
            </div>
            
            <div class="endpoint">
                <div>
                    <span class="method post">POST</span>
                    <span class="path">/track</span>
                </div>
                <div class="description">Track analytics events</div>
            </div>
            
            <div class="endpoint">
                <div>
                    <span class="method get">GET</span>
                    <span class="path">/metrics</span>
                </div>
                <div class="description">Retrieve analytics data</div>
            </div>
        </div>
        
        <div class="footer">
            <p>🚀 Deployed on <a href="https://fly.io">Fly.io</a> • 🗄️ Powered by <a href="https://neon.tech">Neon PostgreSQL</a></p>
            <p style="margin-top: 8px; font-size: 12px;">Built with ❤️ using Hono + TypeScript</p>
        </div>
    </div>
    
    <script>
        // Add some interactive elements
        document.addEventListener('DOMContentLoaded', function() {
            // Animate stats on load
            const stats = document.querySelectorAll('.stat');
            stats.forEach((stat, index) => {
                stat.style.opacity = '0';
                stat.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    stat.style.transition = 'all 0.6s ease';
                    stat.style.opacity = '1';
                    stat.style.transform = 'translateY(0)';
                }, index * 200);
            });
            
            // Add click handlers for endpoints
            document.querySelectorAll('.endpoint').forEach(endpoint => {
                endpoint.style.cursor = 'pointer';
                endpoint.addEventListener('click', function() {
                    const path = this.querySelector('.path').textContent;
                    const method = this.querySelector('.method').textContent;
                    
                    if (path === '/health') {
                        window.open(path, '_blank');
                    } else {
                        alert(\`\${method} \${path}\\n\\nThis endpoint requires API key authentication.\\nCheck the documentation for usage examples.\`);
                    }
                });
                
                endpoint.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = '#edf2f7';
                    this.style.transform = 'translateX(4px)';
                    this.style.transition = 'all 0.2s ease';
                });
                
                endpoint.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = 'transparent';
                    this.style.transform = 'translateX(0)';
                });
            });
        });
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
