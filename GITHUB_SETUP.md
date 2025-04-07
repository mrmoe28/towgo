# GitHub Setup Guide for TowGo

This guide will help you set up the TowGo repository on GitHub.

## Prerequisites

1. A GitHub account
2. A GitHub personal access token with `repo` permissions
3. Git installed on your local machine

## Step 1: Set Up Git LFS

Git LFS (Large File Storage) is necessary for handling large media files in the repository.

```bash
# Install Git LFS
git lfs install

# Verify it's installed
git lfs version
```

## Step 2: Configure Git for Large Files

Increase Git's buffer size to handle large files:

```bash
git config http.postBuffer 524288000
git config http.lowSpeedLimit 1000 
git config http.lowSpeedTime 300
git config core.compression 9
```

## Step 3: Create a New Repository on GitHub

1. Log in to your GitHub account
2. Click on "New repository"
3. Name it (e.g., "towgo" or "towagent")
4. Make it private if you want to keep it confidential
5. Do not initialize with README, .gitignore, or license

## Step 4: Set Up Local Git Repository

```bash
# Initialize the repository
git init

# Add all files to the staging area
git add .

# Make your first commit
git commit -m "Initial commit: Complete TowGo application setup"

# Add GitHub as the remote origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push your code to GitHub (use -u to set the upstream branch)
git push -u origin main
```

## Step 5: Using GitHub Token for Authentication

If you encounter authentication issues, use your GitHub token:

```bash
# Use your token for authentication
git remote set-url origin https://YOUR_GITHUB_TOKEN@github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

## Troubleshooting

### Error: Repository not found

Make sure:
- The repository exists on GitHub
- You have the correct URL
- You have permission to access the repository

### Error: Authentication failed

Try:
- Using a personal access token instead of password
- Generating a new token with appropriate permissions

### Error: File too large

If you get errors about file size:
- Make sure Git LFS is properly set up
- Verify the .gitattributes file includes the correct file extensions
- Try splitting your commits into smaller chunks

### Slow push/timeout

- Try increasing the Git buffer size further
- Split large commits into smaller ones
- Use a wired connection instead of Wi-Fi