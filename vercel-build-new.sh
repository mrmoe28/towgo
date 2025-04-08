#!/bin/bash
set -e

echo "Starting Vercel build process..."
npm install
npm run build

echo "Build process completed!"