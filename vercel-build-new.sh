#!/bin/bash
set -e

echo "Starting Vercel build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npx vite build
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Create necessary directories for Vercel
echo "Setting up directory structure for Vercel..."
mkdir -p dist/client

# Ensure index.js is correctly named
if [ -f "dist/index.js" ]; then
  echo "Renaming index.js to match Vercel expectations..."
  cp dist/index.js dist/index.mjs
fi

echo "Verifying file structure..."
ls -la dist
echo "Build process completed successfully!"