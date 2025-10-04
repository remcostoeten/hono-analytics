#!/bin/bash

set -e

echo "🚀 Starting HONO Analytics Development Environment"

# Function to check if Docker is running
check_docker() {
  if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
  fi
}

# Function to start PostgreSQL
start_postgres() {
  echo "🐘 Starting PostgreSQL..."
  if ! docker-compose up -d postgres; then
    echo "⚠️  Failed to start PostgreSQL, falling back to SQLite"
    export DATABASE_URL="sqlite:./backend/analytics.db"
    return 1
  fi
  
  echo "⏳ Waiting for PostgreSQL to be ready..."
  while ! docker-compose exec postgres pg_isready -U analytics_user -d analytics >/dev/null 2>&1; do
    sleep 1
  done
  
  export DATABASE_URL="postgresql://analytics_user:analytics_pass@localhost:5432/analytics"
  return 0
}

# Function to setup database
setup_database() {
  echo "🗄️  Setting up database..."
  cd packages/backend
  
  if ! pnpm db:generate; then
    echo "❌ Failed to generate migrations"
    exit 1
  fi
  
  if ! pnpm db:migrate; then
    echo "❌ Failed to run migrations"
    exit 1
  fi
  
  cd ..
}

# Function to start backend
start_backend() {
  echo "⚡ Starting backend..."
  pnpm --filter @onolythics/backend dev &
  BACKEND_PID=$!
}

# Function to start SDK build watch
start_sdk() {
  echo "📦 Starting SDK build watch..."
  pnpm --filter @onolythics/sdk dev &
  SDK_PID=$!
}

# Function to start example app
start_example() {
  echo "⚛️  Starting example app..."
  pnpm --filter @onolythics/example dev &
  EXAMPLE_PID=$!
}

# Function to start docs app
start_docs() {
  echo "📚 Starting docs app..."
  pnpm --filter @onolythics/docs dev &
  DOCS_PID=$!
}

# Function to cleanup processes
cleanup() {
  echo "🧹 Cleaning up..."
  if [[ -n $BACKEND_PID ]]; then
    kill $BACKEND_PID 2>/dev/null || true
  fi
  if [[ -n $SDK_PID ]]; then
    kill $SDK_PID 2>/dev/null || true
  fi
  if [[ -n $EXAMPLE_PID ]]; then
    kill $EXAMPLE_PID 2>/dev/null || true
  fi
  if [[ $USE_DOCKER == "true" ]]; then
    docker-compose down
  fi
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Main execution
main() {
  # Check if Docker is available and start PostgreSQL
  if check_docker && start_postgres; then
    USE_DOCKER="true"
    echo "✅ PostgreSQL started successfully"
  else
    USE_DOCKER="false"
    echo "⚠️  Using SQLite for local development"
    export DATABASE_URL="sqlite:./backend/analytics.db"
  fi
  
  # Setup environment variables
  export NODE_ENV="development"
  export PORT="8000"
  # Generate a secure dev API key if not set
  if [ -z "$DEFAULT_API_KEY" ]; then
    export DEFAULT_API_KEY="dev-$(openssl rand -hex 16 2>/dev/null || cat /dev/urandom | tr -dc 'a-f0-9' | fold -w 32 | head -n 1)"
    echo "🔑 Generated development API key: $DEFAULT_API_KEY"
  fi
  export LOG_LEVEL="info"
  
  # Install dependencies if needed
  if [[ ! -d "node_modules" ]]; then
    echo "📦 Installing dependencies..."
    pnpm install
  fi
  
  # Setup database
  setup_database
  
  # Start services
  start_backend
  start_sdk
  start_example
  
  echo "🎉 Development environment is ready!"
  echo ""
  echo "📍 Services:"
  echo "   Backend:  http://localhost:8000"
  echo "   Health:   http://localhost:8000/health"
  echo "   Example:  http://localhost:3000"
  echo ""
  echo "🔑 API Key: $DEFAULT_API_KEY"
  echo ""
  echo "Press Ctrl+C to stop all services"
  
  # Wait for processes to finish
  wait
}

# Run main function
main "$@"
