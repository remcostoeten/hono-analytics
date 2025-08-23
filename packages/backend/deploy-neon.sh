#!/bin/bash

# Deployment script for Hono Analytics Backend with Neon Database

export PATH="/home/remcostoeten/.fly/bin:$PATH"

echo "🚀 Deploying Hono Analytics Backend to Fly.io with Neon Database"

# Check if logged in
if ! flyctl auth whoami &> /dev/null; then
    echo "❌ Please login to Fly.io first:"
    echo "   flyctl auth login"
    exit 1
fi

# Set secrets for production
echo "🔐 Setting up environment variables..."

flyctl secrets set \
  DATABASE_URL="postgresql://neondb_owner:npg_Yij79QvoHSGc@ep-proud-math-a2ew3zb1-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
  NODE_ENV="production" \
  DEFAULT_API_KEY="prod-key-$(openssl rand -hex 16)" \
  CORS_ORIGIN="http://localhost:3000,https://your-docs-site.com" \
  LOG_LEVEL="info"

echo "✅ Environment variables set successfully"

# Deploy the application
echo "📦 Building and deploying..."
flyctl deploy --local-only

echo "✅ Deployment complete!"

# Show app URL
APP_NAME=$(flyctl status --json | jq -r '.Name // "hono-analytics-api"')
echo "🌐 Your API is available at: https://${APP_NAME}.fly.dev"

echo "🧪 Test your deployment:"
echo "  curl https://${APP_NAME}.fly.dev/health"
echo ""
echo "📊 API endpoints:"
echo "  POST https://${APP_NAME}.fly.dev/track"
echo "  GET  https://${APP_NAME}.fly.dev/metrics"
echo ""
echo "🔑 Use your API key in the x-api-key header"
