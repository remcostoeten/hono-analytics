# Neon.tech Setup Guide

Quick guide to set up your Onolythics backend with Neon.tech PostgreSQL.

## Why Neon.tech?

- ✅ **Serverless**: Scales to zero when not in use (cost-effective)
- ✅ **Fast**: Edge-optimized with HTTP-based queries
- ✅ **Branching**: Create isolated DB copies for development/staging
- ✅ **No Maintenance**: Fully managed with automatic backups
- ✅ **Great Developer Experience**: Instant provisioning, modern tooling

## Setup Steps

### 1. Create Neon Project

1. Go to [neon.tech](https://neon.tech) and sign up/login
2. Click "Create Project"
3. Choose your preferred region (Amsterdam for EU users)
4. Give your project a name like "onolythics"

### 2. Create Database & Get Connection String

1. In your Neon dashboard, go to your project
2. Navigate to "Databases" tab
3. Create a new database called `analytics` (or use the default)
4. Go to "Connection Details"
5. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.eu-central-1.aws.neon.tech/analytics?sslmode=require
   ```

### 3. Configure Your App

#### For Local Development:

Create `.env` file in the backend directory:
```bash
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.eu-central-1.aws.neon.tech/analytics?sslmode=require
NODE_ENV=development
PORT=8000
```

#### For Fly.io Production:

Set the secret in your Fly.io app:
```bash
flyctl secrets set DATABASE_URL="postgresql://username:password@ep-xxx-xxx.eu-central-1.aws.neon.tech/analytics?sslmode=require"
```

### 4. Run Database Migrations

Install dependencies and run migrations:
```bash
pnpm install
pnpm run db:migrate
```

### 5. Test the Connection

Start your development server:
```bash
pnpm run dev
```

Test the health endpoint:
```bash
curl http://localhost:8000/health
```

## Neon-Specific Features

### Database Branching

Create branches for different environments:

1. **Development Branch**: 
   ```bash
   # Create a branch in Neon dashboard
   # Use the branch connection string for local development
   ```

2. **Staging Branch**:
   ```bash
   # Create another branch for staging
   # Deploy a staging version of your app with this connection string
   ```

3. **Production**: Use the main branch for production

### Connection Pooling

Neon includes built-in connection pooling, so you don't need to worry about connection limits.

### Monitoring

Monitor your database usage in the Neon dashboard:
- Query performance
- Storage usage
- Connection metrics
- Compute time

## Performance Optimization

The backend automatically detects Neon URLs and uses the optimized serverless driver:

```typescript
// Automatically uses @neondatabase/serverless for .neon.tech URLs
if (databaseUrl.includes('.neon.tech')) {
  const sql = neon(databaseUrl)
  return drizzleNeon(sql, { schema: pgSchema })
}
```

This provides:
- ✅ HTTP-based queries (faster than TCP)
- ✅ Edge-optimized performance
- ✅ Better cold start times
- ✅ Automatic connection management

## Cost Optimization

Neon's pricing is based on:
- **Compute**: Pay for active database time
- **Storage**: Pay for data stored
- **Data Transfer**: Usually free for most use cases

For analytics workloads:
- Use the free tier for development and small production loads
- Consider the "Scale" plan for higher traffic
- Database auto-pauses when inactive (no charges during downtime)

## Troubleshooting

### Connection Issues

1. **SSL Required**: Ensure your connection string includes `?sslmode=require`
2. **IP Allowlist**: Neon allows all IPs by default, but check your project settings
3. **Region**: Choose a region close to your Fly.io deployment

### Query Performance

1. **Indexes**: Add indexes for frequently queried columns
2. **Connection Pooling**: Already handled by Neon automatically
3. **Query Optimization**: Use the Neon dashboard to monitor slow queries

### Development vs Production

1. Use separate Neon projects or branches for dev/staging/production
2. Different connection strings for each environment
3. Consider using database branching for feature development

## Backup & Recovery

Neon automatically handles:
- ✅ Continuous backups
- ✅ Point-in-time recovery
- ✅ Cross-region replication (paid plans)

No manual backup setup required!
