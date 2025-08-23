# HONO Analytics Backend

## Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd packages/backend
vercel --prod
```

3. Set environment variables in Vercel dashboard:
```
NODE_ENV=production
DATABASE_URL=your_postgres_connection_string
DEFAULT_API_KEY=docs-prod-key
```

### Option 2: Fly.io

1. Install Fly CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Create and deploy:
```bash
cd packages/backend
fly launch
fly deploy
```

3. Set secrets:
```bash
fly secrets set DATABASE_URL=your_postgres_connection_string
fly secrets set DEFAULT_API_KEY=docs-prod-key
fly secrets set NODE_ENV=production
```

## Environment Variables

Required:
- `DATABASE_URL`: PostgreSQL connection string
- `DEFAULT_API_KEY`: API key for authentication

Optional:
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (defaults to 8000)
- `LOG_LEVEL`: Logging level (defaults to info)

## Database Setup

For production, you'll need a PostgreSQL database. Recommended services:
- **Neon** (Free tier): https://neon.tech
- **Supabase** (Free tier): https://supabase.com
- **Railway** (Free tier): https://railway.app

## Testing

After deployment, test the API:

```bash
# Health check
curl https://your-api-url.vercel.app/health

# Test tracking
curl -X POST https://your-api-url.vercel.app/track \
  -H "Content-Type: application/json" \
  -H "x-api-key: docs-prod-key" \
  -d '{"url": "/test", "durationMs": 1000}'

# Get metrics
curl https://your-api-url.vercel.app/metrics?range=7d \
  -H "x-api-key: docs-prod-key"
```
