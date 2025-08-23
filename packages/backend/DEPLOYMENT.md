# Deployment Guide - Fly.io

This guide walks you through deploying the Hono Analytics Backend to Fly.io.

## Prerequisites

1. **Install Fly.io CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly.io**:
   ```bash
   flyctl auth login
   ```

3. **Create a Fly.io account** if you don't have one at https://fly.io

## Initial Setup

### 1. Launch the Application

From the backend directory, run:

```bash
flyctl launch
```

This will:
- Create a new Fly.io app
- Generate the `fly.toml` configuration file
- Build and deploy your application

Follow the prompts:
- Choose a unique app name (or use the suggested one)
- Select a region close to your users (we recommend Amsterdam `ams`)
- Don't set up PostgreSQL yet (we'll do it manually for better control)

### 2. Set Up PostgreSQL Database

You have two excellent options for PostgreSQL:

#### Option A: Neon.tech (Recommended)

1. **Create a Neon project** at https://neon.tech
2. **Create a database** for your analytics app
3. **Get your connection string** from the Neon dashboard
4. **Set it as a secret** in your Fly.io app:

```bash
flyctl secrets set DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
```

**Benefits**: Serverless, scales to zero, database branching, no maintenance

#### Option B: Fly.io Managed PostgreSQL

Create a PostgreSQL database managed by Fly.io:

```bash
flyctl postgres create --name hono-analytics-db --region ams
```

Attach it to your application:

```bash
flyctl postgres attach --app hono-analytics-api hono-analytics-db
```

**Benefits**: Co-located with your app, minimal latency

### 3. Configure Environment Variables

Set the required environment variables:

```bash
# Required variables
flyctl secrets set NODE_ENV=production
flyctl secrets set CORS_ORIGIN=https://your-docs-site.com,https://your-other-domain.com
flyctl secrets set DEFAULT_API_KEY=your-production-api-key

# Optional: Set log level
flyctl secrets set LOG_LEVEL=info
```

## Deployment

### Using the Deploy Script

The easiest way to deploy is using the provided script:

```bash
./deploy.sh
```

### Manual Deployment

Alternatively, deploy manually:

```bash
flyctl deploy --local-only
```

## Post-Deployment

### 1. Verify Deployment

Check if your app is running:

```bash
flyctl status
flyctl logs
```

### 2. Test the API

Your API should be available at `https://your-app-name.fly.dev`. Test the health endpoint:

```bash
curl https://your-app-name.fly.dev/health
```

### 3. Database Migration

The database migration runs automatically during deployment via the `release_command` in `fly.toml`. If you need to run it manually:

```bash
flyctl ssh console
pnpm run db:migrate
```

## Configuration Details

### Fly.io Configuration (`fly.toml`)

Key settings in our configuration:

- **Auto-scaling**: Machines automatically start/stop based on traffic
- **Health checks**: HTTP health checks on `/health` endpoint
- **Memory**: 512MB allocated (can be increased if needed)
- **Database migration**: Runs automatically on each deploy
- **HTTPS**: Forced HTTPS with automatic certificate management

### Environment Variables

Required variables for production:

- `NODE_ENV=production`
- `DATABASE_URL` (set automatically when attaching PostgreSQL)
- `CORS_ORIGIN` (comma-separated list of allowed origins)
- `DEFAULT_API_KEY` (for initial project seeding)

## Monitoring & Debugging

### View Logs

```bash
flyctl logs
flyctl logs --follow  # Stream logs in real-time
```

### SSH into the Machine

```bash
flyctl ssh console
```

### Check Application Metrics

```bash
flyctl metrics
```

### Scale the Application

```bash
# Scale to specific number of machines
flyctl scale count 2

# Scale memory
flyctl scale memory 1024
```

## Database Management

### Connect to PostgreSQL

```bash
flyctl postgres connect --app hono-analytics-db
```

### Database Backup

```bash
flyctl postgres backup list --app hono-analytics-db
flyctl postgres backup create --app hono-analytics-db
```

## Custom Domains

To use a custom domain:

```bash
flyctl domains add your-api-domain.com
```

Then add a CNAME record in your DNS settings pointing to your app:
```
CNAME api your-app-name.fly.dev
```

## Troubleshooting

### Common Issues

1. **Build fails**: Check that all dependencies are in `package.json`
2. **Database connection issues**: Verify `DATABASE_URL` is set correctly
3. **CORS errors**: Ensure `CORS_ORIGIN` includes your frontend domains
4. **Memory issues**: Increase memory allocation in `fly.toml`

### Debug Commands

```bash
# Check app status
flyctl status

# View recent deployments
flyctl releases

# Restart the app
flyctl restart

# Check secrets
flyctl secrets list
```

## Security Considerations

1. **Database**: PostgreSQL is only accessible from within your Fly.io network
2. **HTTPS**: All traffic is encrypted via automatic SSL certificates  
3. **Environment Variables**: Secrets are encrypted and only available to your app
4. **CORS**: Configure `CORS_ORIGIN` to only allow your trusted domains

## Costs

Fly.io pricing is based on:
- **Compute**: Pay for running time (machines auto-stop when idle)
- **PostgreSQL**: Small databases are free, larger ones have monthly costs
- **Bandwidth**: Generous free tier, then pay per GB

The current configuration should fit within Fly.io's generous free tier for development and small production workloads.
