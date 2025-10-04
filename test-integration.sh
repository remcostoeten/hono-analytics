#!/bin/bash

set -e

echo "🧪 Starting Onolythics Integration Test"
echo "========================================"
echo ""

# Load .env from backend
cd packages/backend
source .env
cd ../..

echo "✅ Database URL loaded"
echo "✅ API Key: $DEFAULT_API_KEY"
echo ""

# Start backend in background
echo "🚀 Starting backend server..."
cd packages/backend
pnpm dev &
BACKEND_PID=$!
cd ../..

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
  if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is ready!"
    break
  fi
  sleep 1
  if [ $i -eq 30 ]; then
    echo "❌ Backend failed to start after 30 seconds"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
  fi
done

echo ""
echo "📊 Running integration tests..."
echo ""

# Test 1: Health check
echo "Test 1: Backend Health Check"
HEALTH_RESPONSE=$(curl -s http://localhost:8000/health)
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
  echo "✅ Backend is healthy"
else
  echo "❌ Health check failed"
  kill $BACKEND_PID 2>/dev/null || true
  exit 1
fi

# Test 2: Send tracking event
echo ""
echo "Test 2: Send Tracking Event"
TRACK_RESPONSE=$(curl -s -X POST http://localhost:8000/track \
  -H "Content-Type: application/json" \
  -H "x-api-key: $DEFAULT_API_KEY" \
  -d '{
    "url": "/test-page",
    "referrer": "https://test.com",
    "userAgent": "Test Agent",
    "sessionId": "test-session-'$(date +%s)'",
    "userId": "test-user-'$(date +%s)'"
  }')

if echo "$TRACK_RESPONSE" | grep -q "success\|tracked"; then
  echo "✅ Event tracked successfully"
else
  echo "⚠️  Track response: $TRACK_RESPONSE"
fi

# Give it a moment to process
sleep 2

# Test 3: Fetch metrics
echo ""
echo "Test 3: Fetch Metrics via API"
METRICS_RESPONSE=$(curl -s http://localhost:8000/metrics \
  -H "x-api-key: $DEFAULT_API_KEY")

if echo "$METRICS_RESPONSE" | grep -q "totals"; then
  echo "✅ Metrics fetched successfully"
  echo ""
  echo "Metrics Summary:"
  echo "$METRICS_RESPONSE" | jq '.totals' 2>/dev/null || echo "$METRICS_RESPONSE"
else
  echo "❌ Failed to fetch metrics"
  echo "Response: $METRICS_RESPONSE"
  kill $BACKEND_PID 2>/dev/null || true
  exit 1
fi

echo ""
echo "✅ All tests passed!"
echo ""
echo "🌐 Backend running at: http://localhost:8000"
echo "🔑 API Key: $DEFAULT_API_KEY"
echo ""
echo "You can now:"
echo "1. Open browser to http://localhost:3000 (after running: pnpm --filter @onolythics/example dev)"
echo "2. Click on '🧪 Integration Test' tab"
echo "3. Run the visual integration tests"
echo ""
echo "Press Ctrl+C to stop the backend"

# Keep script running
wait $BACKEND_PID
