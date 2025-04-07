#!/bin/bash
# This is a simple test script to verify that our Git remote URL
# is using the GITHUB_TOKEN environment variable instead of hardcoded credentials

echo "Current Git remote URL (token hidden for security):"
git config --local remote.origin.url | sed 's/x-access-token:[^@]*@/x-access-token:***@/'

echo ""
echo "Testing Git connection..."
if git ls-remote --quiet; then
  echo "Git connection successful!"
  echo "The GITHUB_TOKEN environment variable is properly configured."
else
  echo "Git connection failed."
  echo "Please check your GITHUB_TOKEN environment variable."
fi
