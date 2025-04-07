#!/bin/bash
set -e

echo "Updating Git configuration..."

# Check if GITHUB_TOKEN is available
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable is not set."
  echo "Please set the GITHUB_TOKEN environment variable before running this script."
  exit 1
fi

# Update Git configuration to use environment variable
git config remote.origin.url "https://x-access-token:${GITHUB_TOKEN}@github.com/mrmoe28/TowGo.git"
echo "Git configuration updated to use GITHUB_TOKEN environment variable."

# Update .gitignore to prevent future credential leaks
if ! grep -q "\.git-credentials" .gitignore; then
  echo -e "\n# Credentials\n.git-credentials\n*.pem\n*.key\n" >> .gitignore
  echo ".gitignore updated to ignore credential files."
else
  echo ".gitignore already has entries for credential files."
fi

echo "Git configuration update completed!"
echo ""
echo "NOTE: If you need to clean sensitive data from Git history,"
echo "please consult GitHub documentation on using BFG or git-filter-repo tools:"
echo "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository"