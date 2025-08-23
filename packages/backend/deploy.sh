#!/bin/bash

# Deploy script for Hono Analytics Backend to Fly.io

echo "🚀 Starting deployment to Fly.io..."

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl is not installed. Please install it first:"
    echo "   curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if logged in to Fly.io
if ! flyctl auth whoami &> /dev/null; then
    echo "❌ Not logged in to Fly.io. Please run: flyctl auth login"
    exit 1
fi

# Build and deploy
echo "📦 Building and deploying..."
flyctl deploy --local-only

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at: https://hono-analytics-api.fly.dev"

# Optional: Open the app in browser
read -p "🔗 Would you like to open the app in your browser? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    flyctl open
fi
