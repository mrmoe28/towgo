# Vercel Deployment Instructions for TowAgent

This document provides step-by-step instructions for deploying the TowAgent application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com) if you dont have one)
2. The TowAgent GitHub repository
3. Required API keys and credentials (see Environment Variables section)

## Deployment Steps

### Option 1: Deploy from GitHub Repository (Recommended)

1. Log in to your Vercel account
2. Click on "Add New" and select "Project"
3. Connect to your GitHub account
4. Select the TowAgent repository
5. Configure the project settings:
   - Set the Framework Preset to "Other"
   - Leave the Root Directory as "/"
   - Set the Build Command to `./vercel-build-new.sh`
   - Set the Output Directory to "dist"
6. Configure environment variables (see below)
7. Click "Deploy"
