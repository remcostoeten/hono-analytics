# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY backend/package.json backend/
COPY sdk/package.json sdk/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY backend/ backend/
COPY sdk/ sdk/

# Build backend
RUN pnpm --filter backend build

# Production stage
FROM node:18-alpine AS production

# Install pnpm
RUN npm install -g pnpm

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S analytics -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package.json backend/pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder --chown=analytics:nodejs /app/backend/dist ./dist
COPY --from=builder --chown=analytics:nodejs /app/backend/src/db ./src/db

# Copy migration files and schema
COPY --from=builder --chown=analytics:nodejs /app/backend/drizzle.config.ts ./
COPY --from=builder --chown=analytics:nodejs /app/backend/migrations ./migrations

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
