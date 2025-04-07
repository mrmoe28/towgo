#!/bin/bash
set -e

echo "Starting Git repository cleanup..."

# Check if GITHUB_TOKEN is available
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable is not set."
  echo "Please set the GITHUB_TOKEN environment variable before running this script."
  exit 1
fi

# 1. Clean Git history with BFG
echo "Cleaning Git history to remove sensitive data..."
java -jar bfg.jar --delete-files .git-credentials .
echo "Git history cleaning completed."

# 2. Force Git garbage collection
echo "Running Git garbage collection..."
git gc --prune=now --aggressive
echo "Git garbage collection completed."

# 3. Update Git configuration to use environment variable
echo "Updating Git configuration..."
git config remote.origin.url "https://x-access-token:${GITHUB_TOKEN}@github.com/mrmoe28/TowGo.git"
echo "Git configuration updated."

# 4. Update .gitignore to prevent future credential leaks
echo "Updating .gitignore file..."
if ! grep -q "\.git-credentials" .gitignore; then
  echo -e "\n# Credentials\n.git-credentials\n*.pem\n*.key\n" >> .gitignore
  git add .gitignore
  git commit -m "Update .gitignore to prevent credential leaks"
fi
echo ".gitignore updated."

echo "Git repository cleanup completed successfully!"
echo ""
echo "IMPORTANT: You can now try pushing to GitHub with the following command:"
echo "git push origin <branch-name> --force"
echo ""
echo "NOTE: This is a force push which will overwrite remote history."
echo "Make sure all team members are aware of this change."