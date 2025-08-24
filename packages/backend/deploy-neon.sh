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

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo "   Please set it before running this script:"
    echo "   export DATABASE_URL='postgresql://user:pass@host/dbname?sslmode=require'"
    exit 1
fi

# Get app name if it exists
APP_NAME=$(flyctl status --json 2>/dev/null | jq -r '.Name // ""')
if [ -z "$APP_NAME" ]; then
    APP_NAME="hono-analytics-api"
fi

# Set default CORS origins if not provided
if [ -z "$CORS_ORIGIN" ]; then
    # Include the Fly.io app URL in CORS origins
    CORS_ORIGIN="http://localhost:3000,https://${APP_NAME}.fly.dev"
    echo "ℹ️  Using default CORS origins: $CORS_ORIGIN"
    echo "   To customize, set CORS_ORIGIN environment variable before running this script"
fi

# Generate API key if not provided
if [ -z "$DEFAULT_API_KEY" ]; then
    DEFAULT_API_KEY="prod-key-$(openssl rand -hex 16)"
    echo "🔑 Generated new API key: $DEFAULT_API_KEY"
    echo "   Save this key - you'll need it to access the API!"
else
    echo "🔑 Using provided API key"
fi

# Set secrets for production
echo "🔐 Setting up environment variables..."
echo "   DATABASE_URL: [hidden]"
echo "   CORS_ORIGIN: $CORS_ORIGIN"
echo "   LOG_LEVEL: ${LOG_LEVEL:-info}"
echo "   NODE_ENV: production"

flyctl secrets set \
  DATABASE_URL="$DATABASE_URL" \
  NODE_ENV="production" \
  DEFAULT_API_KEY="$DEFAULT_API_KEY" \
  CORS_ORIGIN="$CORS_ORIGIN" \
  LOG_LEVEL="${LOG_LEVEL:-info}"

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
