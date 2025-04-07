# Vercel Deployment Guide for TowGo

This guide walks you through deploying the TowGo application to Vercel.

## Prerequisites

1. A Vercel account (create one at [vercel.com](https://vercel.com) if you don't have one)
2. A GitHub account with the TowGo repository cloned

## Deployment Options

### Option 1: Deploy from GitHub Repository (Recommended)

1. Log in to your Vercel account at [vercel.com](https://vercel.com)
2. Click on "Add New" and select "Project"
3. Select your GitHub account and the TowGo repository
4. Configure the project as described in the "Project Configuration" section below

### Option 2: Deploy from Local Machine

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel from the CLI:
   ```bash
   vercel login
   ```

3. Navigate to your project directory:
   ```bash
   cd path/to/towgo
   ```

4. Deploy the project:
   ```bash
   vercel --prod
   ```

### Option 3: Deploy with Specific Project ID

If you already have a Vercel project set up (project ID: prj_743UdILDKGXsLyKWWHEUd87EF9JK), you can deploy directly to it:

```bash
vercel --prod --yes --projectId=prj_743UdILDKGXsLyKWWHEUd87EF9JK
```

## Project Configuration

The project is already configured with the necessary Vercel deployment files:

- **vercel.json** - Contains the build configuration and routing rules
- **vercel-build-new.sh** - The build script that prepares the application for deployment
- **package.vercel.json** - Package configuration specific to Vercel deployment

## Environment Variables

Add the following environment variables in the Vercel project settings:

- `DATABASE_URL`: Your PostgreSQL database connection string
- `PERPLEXITY_API_KEY`: Your Perplexity API key
- `GOOGLE_MAPS_API_KEY`: Your Google Maps API key
- `SESSION_SECRET`: A random string for securing sessions
- `GITHUB_CLIENT_ID`: Your GitHub OAuth client ID (if using GitHub authentication)
- `GITHUB_CLIENT_SECRET`: Your GitHub OAuth client secret (if using GitHub authentication)

## Troubleshooting Common Issues

### Build Errors

If you encounter the "vite: command not found" error:
1. Make sure your project is using the new `vercel-build-new.sh` script in your vercel.json configuration
2. The script should be setting up your package.json correctly before running the build command

### Database Connection Issues

If your app can't connect to the database:
1. Ensure your `DATABASE_URL` is correctly formatted
2. Check if your database provider allows connections from Vercel's IP ranges
3. If using a local database, consider using a cloud-hosted database like Neon.tech

### GitHub OAuth Configuration

For GitHub OAuth:
1. Update your GitHub OAuth app's callback URL to match your Vercel deployment URL
2. The callback URL should be: `https://your-vercel-app.vercel.app/auth/github/callback`

## Updating Your Deployment

When you make changes to your application:

1. Push your changes to GitHub if using GitHub integration
2. If deploying manually, run the Vercel CLI commands again

## Monitoring Your Deployment

After deployment:
1. Visit the Vercel dashboard to monitor your application
2. Check server logs for any issues
3. Set up alerts for application errors or performance issues