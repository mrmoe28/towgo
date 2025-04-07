#!/bin/bash
set -e

echo "Starting Vercel build process..."

# Copy the Vercel-specific package.json
echo "Copying Vercel-specific package.json..."
cp package.vercel.json package.json

echo "Build process completed successfully!"
