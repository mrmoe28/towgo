# Vercel Deployment Guide for TowGo

This guide walks you through deploying the TowGo application to Vercel.

## Prerequisites

1. A Vercel account (create one at [vercel.com](https://vercel.com) if you don't have one)
2. The TowGo deployment package (towgo-deployment.zip)

## Step 1: Download and Extract the Deployment Package

1. Download the `towgo-deployment.zip` file
2. Extract the ZIP file on your local machine

## Step 2: Set Up a New Vercel Project

1. Log in to your Vercel account at [vercel.com](https://vercel.com)
2. Click on "Add New" and select "Project"

## Step 3: Import the Project

You have two options:

### Option A: Deploy from Local Directory

1. Install the Vercel CLI
   ```bash
   npm install -g vercel
   ```

2. Navigate to the extracted folder
   ```bash
   cd path/to/extracted/folder
   ```

3. Run the Vercel CLI
   ```bash
   vercel
   ```

4. Follow the prompts to deploy

### Option B: Import Directory via Vercel Dashboard

1. In the Vercel dashboard, click "Import Project"
2. Choose "Upload" under "Import Git Repository"
3. Upload the extracted folder

## Step 4: Configure Project Settings

Set the following configuration options:

- **Framework Preset**: Other
- **Root Directory**: /
- **Build Command**: ./vercel-build.sh
- **Output Directory**: dist/public

## Step 5: Environment Variables

Add the following environment variables in the Vercel project settings:

- `DATABASE_URL`: Your PostgreSQL database connection string
- `PERPLEXITY_API_KEY`: Your Perplexity API key
- `GOOGLE_MAPS_API_KEY`: Your Google Maps API key
- `SESSION_SECRET`: A random string for securing sessions
- `GITHUB_CLIENT_ID`: Your GitHub OAuth client ID (if using GitHub authentication)
- `GITHUB_CLIENT_SECRET`: Your GitHub OAuth client secret (if using GitHub authentication)

## Step 6: Deploy

Click "Deploy" to start the deployment process.

## Step 7: Configure Domain (Optional)

1. In your project settings, navigate to the "Domains" tab
2. Add your custom domain if you have one

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Check the build logs in the Vercel dashboard
2. Verify your environment variables are correctly set
3. Make sure your database is accessible from Vercel

### Database Connection Issues

If your app can't connect to the database:

1. Ensure your `DATABASE_URL` is correctly formatted
2. Check if your database provider allows connections from Vercel's IP ranges
3. If using a local database, consider using a cloud-hosted database

### OAuth Configuration

For GitHub OAuth:

1. Update your GitHub OAuth app's callback URL to match your Vercel deployment URL
2. The callback URL should be: `https://your-vercel-app.vercel.app/auth/github/callback`

## Updating Your Deployment

To update your deployment:

1. Make changes to your local code
2. Create a new deployment package
3. Deploy again using the same steps above

Alternatively, connect your GitHub repository to Vercel for automatic deployments.