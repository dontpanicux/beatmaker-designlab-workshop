# Setting Up GitHub Repository

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in the repository details:
   - **Repository name**: `beatmaker-designlab-workshop` (or your preferred name)
   - **Description**: "Web-based beatmaker for creating music online"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

## Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these commands:

```bash
# Navigate to your project directory
cd "/Users/blakekaaos/Documents/dev stuff/beatmaker-designlab-workshop"

# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/beatmaker-designlab-workshop.git

# Rename branch to main if needed (GitHub uses 'main' by default)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

## Alternative: Using SSH (if you have SSH keys set up)

If you prefer SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/beatmaker-designlab-workshop.git
git branch -M main
git push -u origin main
```

## Step 3: Verify

After pushing, refresh your GitHub repository page. You should see all your files there!

## Future Commits

When you make changes and want to push them:

```bash
git add .
git commit -m "Your commit message"
git push
```

## Notes

- Your audio samples (WAV files) are included in the commit. If they're large, consider using Git LFS later
- Environment variables (`.env` files) are already in `.gitignore` and won't be committed
- `node_modules` is ignored and won't be pushed
