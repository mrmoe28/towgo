#!/bin/bash
set -e

echo "Starting Vercel build process..."

# Copy the Vercel-specific package.json
echo "Copying Vercel-specific package.json..."
cp package.vercel.json package.json

# Install dependencies
echo "Installing dependencies..."
npm install

# Run build script
echo "Building application..."
npm run vercel-build

echo "Build process completed successfully!"
