#!/bin/bash

# Wrapper script for Hono Analytics Backend deployment with environment management

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Hono Analytics Backend Deployment Script${NC}"
echo ""

# Parse command line arguments
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo "Usage: ./deploy.sh [OPTIONS]"
    echo ""
    echo "This script manages deployment to Fly.io with Neon database."
    echo ""
    echo "Environment variables (can be set in .env.deploy or exported):"
    echo "  DATABASE_URL      - PostgreSQL connection string (required)"
    echo "  CORS_ORIGIN       - Comma-separated list of allowed origins"
    echo "  DEFAULT_API_KEY   - API key for initial project"
    echo "  LOG_LEVEL         - Logging level (debug, info, warn, error)"
    echo ""
    echo "Examples:"
    echo "  # Using .env.deploy file:"
    echo "  ./deploy.sh"
    echo ""
    echo "  # Using environment variables:"
    echo "  DATABASE_URL='postgresql://...' ./deploy.sh"
    echo ""
    echo "  # With all options:"
    echo "  DATABASE_URL='postgresql://...' CORS_ORIGIN='https://app.com' ./deploy.sh"
    exit 0
fi

# Check if .env.deploy exists and source it
if [ -f ".env.deploy" ]; then
    echo -e "${GREEN}✓ Loading environment from .env.deploy${NC}"
    set -a
    source .env.deploy
    set +a
else
    echo -e "${YELLOW}ℹ️  No .env.deploy file found${NC}"
    echo "   You can create one from .env.deploy.example:"
    echo "   cp .env.deploy.example .env.deploy"
    echo ""
fi

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo -e "${RED}❌ flyctl is not installed${NC}"
    echo "   Please install it first:"
    echo "   curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if logged in to Fly.io
if ! flyctl auth whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Fly.io${NC}"
    echo "   Please run: flyctl auth login"
    exit 1
fi

# Validate required variables
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL is required${NC}"
    echo ""
    echo "Please set it in one of these ways:"
    echo "1. Create .env.deploy file (recommended):"
    echo "   cp .env.deploy.example .env.deploy"
    echo "   # Edit .env.deploy with your database URL"
    echo ""
    echo "2. Export the variable:"
    echo "   export DATABASE_URL='postgresql://...'"
    echo ""
    echo "3. Pass it inline:"
    echo "   DATABASE_URL='postgresql://...' ./deploy.sh"
    exit 1
fi

# Display configuration (hide sensitive data)
echo -e "${GREEN}📋 Deployment Configuration:${NC}"
echo "   DATABASE_URL: [configured]"
[ ! -z "$CORS_ORIGIN" ] && echo "   CORS_ORIGIN: $CORS_ORIGIN" || echo "   CORS_ORIGIN: [will use defaults]"
[ ! -z "$DEFAULT_API_KEY" ] && echo "   DEFAULT_API_KEY: [configured]" || echo "   DEFAULT_API_KEY: [will be auto-generated]"
echo "   LOG_LEVEL: ${LOG_LEVEL:-info}"
echo ""

# Confirm before deployment
read -p "Continue with deployment to Fly.io? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""

# Run the Neon deployment script
if [ -f "./deploy-neon.sh" ]; then
    ./deploy-neon.sh
else
    echo -e "${RED}❌ deploy-neon.sh not found${NC}"
    echo "   Please ensure deploy-neon.sh exists in the current directory"
    exit 1
fi
