# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY packages/backend/package.json packages/backend/
COPY packages/sdk/package.json packages/sdk/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/backend/ packages/backend/
COPY packages/sdk/ packages/sdk/

# Build backend
RUN pnpm --filter @hono-analytics/backend build

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S analytics -u 1001

# Set working directory
WORKDIR /app

# Copy built application and dependencies from builder
COPY --from=builder --chown=analytics:nodejs /app/packages/backend/dist ./dist
COPY --from=builder --chown=analytics:nodejs /app/packages/backend/node_modules ./node_modules
COPY --from=builder --chown=analytics:nodejs /app/packages/backend/src/db ./src/db

# Copy migration files and schema
COPY --from=builder --chown=analytics:nodejs /app/packages/backend/drizzle.config.ts ./
COPY --from=builder --chown=analytics:nodejs /app/packages/backend/migrations ./migrations

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Switch to non-root user
USER analytics

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:8000/health').then(()=>process.exit(0)).catch(()=>process.exit(1))"

# Start application
CMD ["node", "dist/server.js"]
