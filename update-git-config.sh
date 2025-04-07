#!/bin/bash
# Script to update Git configuration to use GITHUB_TOKEN environment variable
# instead of hardcoded credentials

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable is not set"
  echo "Please ensure the GITHUB_TOKEN secret is available before running this script"
  exit 1
fi

# Update Git remote URL to use the environment variable
echo "Updating Git remote URL to use GITHUB_TOKEN environment variable..."
git config --local remote.origin.url "https://x-access-token:${GITHUB_TOKEN}@github.com/mrmoe28/TowGo.git"

# Verify the change (without showing the actual token)
echo "New remote URL configured (token hidden for security):"
git config --local remote.origin.url | sed 's/x-access-token:[^@]*@/x-access-token:***@/'

echo "Git configuration updated successfully"
