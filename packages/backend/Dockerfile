FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Set production environment
ENV NODE_ENV=production
ENV PORT=8000

# Expose port
EXPOSE 8000

# Run database migrations and start server with tsx
CMD ["sh", "-c", "pnpm run db:migrate && npx tsx src/server.ts"]
