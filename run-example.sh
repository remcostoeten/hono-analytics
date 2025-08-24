#!/bin/bash

# HONO Analytics - Run Example with Backend
# This script starts both the backend API and the example frontend

echo "🚀 Starting HONO Analytics Example..."
echo "📊 Backend will run on http://localhost:8000"
echo "🌐 Frontend will run on http://localhost:3000"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  pnpm install
fi

# Build the SDK first
echo "🔨 Building SDK..."
cd packages/sdk && pnpm run build && cd ../..

# Run both backend and frontend concurrently
echo "🏃‍♂️ Starting services..."
cd apps/example && pnpm install && pnpm run dev:with-backend
